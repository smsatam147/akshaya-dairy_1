from django.urls import path
from .views import (
    MilkCollectionListCreateView, MilkCollectionDetailView,
    daily_summary_view, sync_offline_entries,
    cattle_milk_summary_view, cattle_monthly_summary_view,
)

urlpatterns = [
    path('collections/',             MilkCollectionListCreateView.as_view()),
    path('collections/sync/',        sync_offline_entries),
    path('collections/<uuid:pk>/',   MilkCollectionDetailView.as_view()),
    path('summary/daily/',           daily_summary_view),
    path('summary/cattle/',          cattle_milk_summary_view),
    path('summary/monthly/',         cattle_monthly_summary_view),
]
