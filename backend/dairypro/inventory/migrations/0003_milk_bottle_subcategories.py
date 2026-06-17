# Migration: Replace generic milk bottle items with WC / In-Office / In-Stock variants.
# Stock quantities seeded from Excel snapshot (latest row: 13-Jun-2026).

import uuid
from django.db import migrations

# Items to remove (generic milk bottles from migration 0002)
OLD_CODES = ['BTL-MILK-1L', 'BTL-MILK-500ML']

# 6 replacement items — quantity_on_hand from latest Excel row
NEW_ITEMS = [
    {
        'id':               uuid.UUID('22222222-bbbb-4000-8000-000000000001'),
        'item_code':        'BTL-MILK-WC-1L',
        'name':             'Milk Bottle WC – 1 Litre',
        'category':         'Bottles',
        'unit':             'bottle',
        'quantity_on_hand': 14,
        'reorder_level':    10,
        'reorder_quantity': 50,
        'unit_cost':        None,
        'supplier_name':    '',
        'supplier_contact': '',
        'is_active':        True,
    },
    {
        'id':               uuid.UUID('22222222-bbbb-4000-8000-000000000002'),
        'item_code':        'BTL-MILK-WC-500ML',
        'name':             'Milk Bottle WC – 500 ml',
        'category':         'Bottles',
        'unit':             'bottle',
        'quantity_on_hand': 42,
        'reorder_level':    30,
        'reorder_quantity': 100,
        'unit_cost':        None,
        'supplier_name':    '',
        'supplier_contact': '',
        'is_active':        True,
    },
    {
        'id':               uuid.UUID('22222222-bbbb-4000-8000-000000000003'),
        'item_code':        'BTL-MILK-OFF-1L',
        'name':             'Milk Bottle In Office – 1 Litre',
        'category':         'Bottles',
        'unit':             'bottle',
        'quantity_on_hand': 10,
        'reorder_level':    10,
        'reorder_quantity': 50,
        'unit_cost':        None,
        'supplier_name':    '',
        'supplier_contact': '',
        'is_active':        True,
    },
    {
        'id':               uuid.UUID('22222222-bbbb-4000-8000-000000000004'),
        'item_code':        'BTL-MILK-OFF-500ML',
        'name':             'Milk Bottle In Office – 500 ml',
        'category':         'Bottles',
        'unit':             'bottle',
        'quantity_on_hand': 50,
        'reorder_level':    30,
        'reorder_quantity': 100,
        'unit_cost':        None,
        'supplier_name':    '',
        'supplier_contact': '',
        'is_active':        True,
    },
    {
        'id':               uuid.UUID('22222222-bbbb-4000-8000-000000000005'),
        'item_code':        'BTL-MILK-STK-1L',
        'name':             'Milk Bottle In Stock – 1 Litre',
        'category':         'Bottles',
        'unit':             'bottle',
        'quantity_on_hand': 0,
        'reorder_level':    20,
        'reorder_quantity': 100,
        'unit_cost':        None,
        'supplier_name':    '',
        'supplier_contact': '',
        'is_active':        True,
    },
    {
        'id':               uuid.UUID('22222222-bbbb-4000-8000-000000000006'),
        'item_code':        'BTL-MILK-STK-500ML',
        'name':             'Milk Bottle In Stock – 500 ml',
        'category':         'Bottles',
        'unit':             'bottle',
        'quantity_on_hand': 35,
        'reorder_level':    20,
        'reorder_quantity': 100,
        'unit_cost':        None,
        'supplier_name':    '',
        'supplier_contact': '',
        'is_active':        True,
    },
]


def upgrade(apps, schema_editor):
    InventoryItem = apps.get_model('inventory', 'InventoryItem')
    # Remove old generic milk items
    InventoryItem.objects.filter(item_code__in=OLD_CODES).delete()
    # Seed 6 new sub-category items
    for data in NEW_ITEMS:
        InventoryItem.objects.get_or_create(item_code=data['item_code'], defaults=data)


def downgrade(apps, schema_editor):
    InventoryItem = apps.get_model('inventory', 'InventoryItem')
    InventoryItem.objects.filter(item_code__in=[d['item_code'] for d in NEW_ITEMS]).delete()
    # Restore original generic items
    for code, name in [('BTL-MILK-1L', 'Milk Bottle – 1 Litre'), ('BTL-MILK-500ML', 'Milk Bottle – 500 ml')]:
        InventoryItem.objects.get_or_create(
            item_code=code,
            defaults={
                'name': name, 'category': 'Bottles', 'unit': 'bottle',
                'quantity_on_hand': 0, 'reorder_level': 50,
                'supplier_name': '', 'supplier_contact': '', 'is_active': True,
            }
        )


class Migration(migrations.Migration):
    dependencies = [
        ('inventory', '0002_add_bottles_category_and_items'),
    ]
    operations = [
        migrations.RunPython(upgrade, reverse_code=downgrade),
    ]
