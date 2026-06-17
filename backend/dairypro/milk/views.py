"""milk/views.py — Milk collection, daily summary, offline sync."""
import logging
from decimal import Decimal
from django.db.models import Sum, Avg, Count
from django.db import IntegrityError
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import MilkCollection, Shift
from .serializers import MilkCollectionSerializer, MilkCollectionSyncSerializer
from dairypro.core.permissions import IsFarmManagerOrAbove, IsAnyAuthenticated
from dairypro.core.utils import write_audit_log, success_response
from dairypro.cattle.models import Cattle, CattleStatus

logger = logging.getLogger('dairypro')

DEVIATION_THRESHOLD = Decimal('20.0')  # FR-M-04: alert if >20% drop vs 7-day avg


class MilkCollectionDetailView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/v1/milk/collections/<pk>/ — Retrieve or update a single entry."""
    serializer_class   = MilkCollectionSerializer
    permission_classes = [IsAuthenticated]
    queryset           = MilkCollection.objects.select_related('cattle', 'field_worker')

    def perform_update(self, serializer):
        mc = serializer.save()
        write_audit_log(self.request.user, 'UPDATE', 'milk_collection',
                        resource_id=mc.id,
                        new_values={'qty': str(mc.quantity_litres),
                                    'fat': str(mc.fat_percentage),
                                    'snf': str(mc.snf_percentage)},
                        request=self.request)


class MilkCollectionListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/v1/milk/collections/"""
    serializer_class   = MilkCollectionSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields   = ['collection_date', 'shift', 'cattle', 'quality_grade']

    def get_queryset(self):
        user = self.request.user
        qs = MilkCollection.objects.select_related('cattle', 'field_worker')
        # Field workers see only their own entries (FR-AU-01 RBAC)
        from dairypro.core.models import Role
        if user.role == Role.FIELD_WORKER:
            qs = qs.filter(field_worker=user)
        return qs.order_by('-collection_date', '-created_at')

    def perform_create(self, serializer):
        cattle = serializer.validated_data['cattle']
        # FR-M-03: Block entry for inactive cattle
        if cattle.status not in [CattleStatus.ACTIVE, CattleStatus.LACTATING]:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(
                f'Cattle {cattle.tag_number} has status "{cattle.status}". '
                'Only Active or Lactating cattle can have milk recorded.'
            )
        mc = serializer.save(field_worker=self.request.user)
        # FR-M-04: Check yield deviation vs 7-day rolling average
        self._check_yield_alert(mc)
        write_audit_log(self.request.user, 'CREATE', 'milk_collection',
                        resource_id=mc.id,
                        new_values={'cattle': str(cattle.id),
                                    'qty': str(mc.quantity_litres),
                                    'grade': mc.quality_grade},
                        request=self.request)

    def _check_yield_alert(self, mc):
        from datetime import timedelta
        from django.utils import timezone
        from .models import YieldAlert
        cutoff = mc.collection_date - timedelta(days=7)
        avg_qs = MilkCollection.objects.filter(
            cattle=mc.cattle,
            collection_date__gte=cutoff,
            collection_date__lt=mc.collection_date,
            shift=mc.shift,
        ).aggregate(avg=Avg('quantity_litres'))
        avg_yield = avg_qs['avg']
        if avg_yield and avg_yield > 0:
            deviation = ((avg_yield - mc.quantity_litres) / avg_yield) * 100
            if deviation >= DEVIATION_THRESHOLD:
                YieldAlert.objects.create(
                    cattle=mc.cattle,
                    alert_date=mc.collection_date,
                    expected_yield=avg_yield,
                    actual_yield=mc.quantity_litres,
                    deviation_pct=deviation,
                )
                logger.warning('Yield alert created for %s: %.1f%% drop',
                               mc.cattle.tag_number, deviation)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsFarmManagerOrAbove])
def daily_summary_view(request):
    """GET /api/v1/milk/summary/daily/?date=YYYY-MM-DD"""
    from .serializers import DailySummarySerializer
    date = request.query_params.get('date')
    if not date:
        from django.utils import timezone
        date = timezone.now().date()

    qs = MilkCollection.objects.filter(collection_date=date)
    agg = qs.aggregate(
        total_litres=Sum('quantity_litres'),
        avg_fat=Avg('fat_percentage'),
        avg_snf=Avg('snf_percentage'),
        cattle_count=Count('cattle', distinct=True),
    )
    morning = qs.filter(shift=Shift.MORNING).aggregate(l=Sum('quantity_litres'))['l'] or 0
    evening = qs.filter(shift=Shift.EVENING).aggregate(l=Sum('quantity_litres'))['l'] or 0
    grade_breakdown = {g: qs.filter(quality_grade=g).count() for g in ['A','B','C','Rejected']}

    return success_response(data={
        'date': str(date),
        'total_litres': agg['total_litres'] or 0,
        'morning_litres': morning,
        'evening_litres': evening,
        'cattle_count': agg['cattle_count'] or 0,
        'avg_fat_pct': round(agg['avg_fat'] or 0, 2),
        'avg_snf_pct': round(agg['avg_snf'] or 0, 2),
        'grade_breakdown': grade_breakdown,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cattle_milk_summary_view(request):
    """GET /api/v1/milk/summary/cattle/ — Total milk per cattle (all-time or date range)."""
    qs = MilkCollection.objects.all()
    date_from = request.query_params.get('date_from')
    date_to   = request.query_params.get('date_to')
    if date_from:
        qs = qs.filter(collection_date__gte=date_from)
    if date_to:
        qs = qs.filter(collection_date__lte=date_to)

    results = (
        qs.values('cattle__id', 'cattle__name', 'cattle__tag_number')
        .annotate(
            total_litres=Sum('quantity_litres'),
            morning_litres=Sum('quantity_litres', filter=__import__('django.db.models', fromlist=['Q']).Q(shift=Shift.MORNING)),
            evening_litres=Sum('quantity_litres', filter=__import__('django.db.models', fromlist=['Q']).Q(shift=Shift.EVENING)),
            total_entries=Count('id'),
        )
        .order_by('-total_litres')
    )

    data = [
        {
            'cattle_id':      r['cattle__id'],
            'cattle_name':    r['cattle__name'],
            'tag_number':     r['cattle__tag_number'],
            'total_litres':   round(float(r['total_litres'] or 0), 2),
            'morning_litres': round(float(r['morning_litres'] or 0), 2),
            'evening_litres': round(float(r['evening_litres'] or 0), 2),
            'total_entries':  r['total_entries'],
        }
        for r in results
    ]

    grand_total = sum(r['total_litres'] for r in data)
    return success_response(data={'cattle_summary': data, 'grand_total': round(grand_total, 2)})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cattle_monthly_summary_view(request):
    """GET /api/v1/milk/summary/monthly/ — Milk per cattle per month."""
    from django.db.models.functions import TruncMonth
    from django.db.models import Q

    qs = MilkCollection.objects.annotate(month=TruncMonth('collection_date'))

    results = (
        qs.values('cattle__id', 'cattle__name', 'cattle__tag_number', 'month')
        .annotate(
            total_litres=Sum('quantity_litres'),
            morning_litres=Sum('quantity_litres', filter=Q(shift=Shift.MORNING)),
            evening_litres=Sum('quantity_litres', filter=Q(shift=Shift.EVENING)),
        )
        .order_by('cattle__name', 'month')
    )

    # Build: { cattle_name: { month_label: total } }
    cattle_map = {}
    months_set = []

    for r in results:
        name = r['cattle__name'] or r['cattle__tag_number']
        tag  = r['cattle__tag_number']
        cid  = str(r['cattle__id'])
        month_label = r['month'].strftime('%b %Y') if r['month'] else ''

        if month_label and month_label not in months_set:
            months_set.append(month_label)

        if cid not in cattle_map:
            cattle_map[cid] = {
                'cattle_id':   cid,
                'cattle_name': name,
                'tag_number':  tag,
                'months':      {},
            }
        cattle_map[cid]['months'][month_label] = round(float(r['total_litres'] or 0), 2)

    # Sort months chronologically
    from datetime import datetime
    def month_key(m):
        try:
            return datetime.strptime(m, '%b %Y')
        except Exception:
            return datetime.min

    months_set.sort(key=month_key)

    cattle_list = sorted(cattle_map.values(), key=lambda x: x['cattle_name'])

    return success_response(data={
        'months': months_set,
        'cattle': cattle_list,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sync_offline_entries(request):
    """POST /api/v1/milk/collections/sync/ — Batch offline sync (FR-AU-06)."""
    entries = request.data.get('entries', [])
    accepted, rejected = 0, []

    for i, entry_data in enumerate(entries):
        ser = MilkCollectionSerializer(data=entry_data)
        if not ser.is_valid():
            rejected.append({'entry_index': i, 'reason': str(ser.errors)})
            continue
        try:
            cattle = ser.validated_data['cattle']
            if cattle.status not in [CattleStatus.ACTIVE, CattleStatus.LACTATING]:
                rejected.append({'entry_index': i,
                                  'reason': f'Cattle {cattle.tag_number} is not active.'})
                continue
            mc = ser.save(field_worker=request.user, is_synced=True)
            accepted += 1
        except IntegrityError:
            rejected.append({'entry_index': i,
                              'reason': 'Duplicate entry for this cattle/date/shift.'})

    resp_status = status.HTTP_207_MULTI_STATUS if rejected else status.HTTP_200_OK
    return Response({
        'status': 'partial' if rejected else 'success',
        'data': {'accepted': accepted, 'rejected': len(rejected), 'conflicts': rejected},
        'message': f'{accepted} entries accepted, {len(rejected)} rejected.',
        'errors': {},
    }, status=resp_status)
