# Generated manually — adds Bottles category and seeds 6 bottle inventory items.

import uuid
from django.db import migrations, models


BOTTLE_ITEMS = [
    {
        'id':              uuid.UUID('11111111-aaaa-4000-8000-000000000001'),
        'item_code':       'BTL-MILK-1L',
        'name':            'Milk Bottle – 1 Litre',
        'category':        'Bottles',
        'unit':            'bottle',
        'quantity_on_hand': 0,
        'reorder_level':   50,
        'reorder_quantity': 200,
        'unit_cost':       None,
        'supplier_name':   '',
        'supplier_contact': '',
        'is_active':       True,
    },
    {
        'id':              uuid.UUID('11111111-aaaa-4000-8000-000000000002'),
        'item_code':       'BTL-MILK-500ML',
        'name':            'Milk Bottle – 500 ml',
        'category':        'Bottles',
        'unit':            'bottle',
        'quantity_on_hand': 0,
        'reorder_level':   50,
        'reorder_quantity': 200,
        'unit_cost':       None,
        'supplier_name':   '',
        'supplier_contact': '',
        'is_active':       True,
    },
    {
        'id':              uuid.UUID('11111111-aaaa-4000-8000-000000000003'),
        'item_code':       'BTL-GHEE-1L',
        'name':            'Ghee Bottle – 1 Litre',
        'category':        'Bottles',
        'unit':            'bottle',
        'quantity_on_hand': 0,
        'reorder_level':   30,
        'reorder_quantity': 100,
        'unit_cost':       None,
        'supplier_name':   '',
        'supplier_contact': '',
        'is_active':       True,
    },
    {
        'id':              uuid.UUID('11111111-aaaa-4000-8000-000000000004'),
        'item_code':       'BTL-GHEE-500ML',
        'name':            'Ghee Bottle – 500 ml',
        'category':        'Bottles',
        'unit':            'bottle',
        'quantity_on_hand': 0,
        'reorder_level':   30,
        'reorder_quantity': 100,
        'unit_cost':       None,
        'supplier_name':   '',
        'supplier_contact': '',
        'is_active':       True,
    },
    {
        'id':              uuid.UUID('11111111-aaaa-4000-8000-000000000005'),
        'item_code':       'BTL-GHEE-100ML',
        'name':            'Ghee Bottle – 100 ml',
        'category':        'Bottles',
        'unit':            'bottle',
        'quantity_on_hand': 0,
        'reorder_level':   50,
        'reorder_quantity': 200,
        'unit_cost':       None,
        'supplier_name':   '',
        'supplier_contact': '',
        'is_active':       True,
    },
    {
        'id':              uuid.UUID('11111111-aaaa-4000-8000-000000000006'),
        'item_code':       'BTL-JIVA-1L',
        'name':            'Jivamrut Bottle – 1 Litre',
        'category':        'Bottles',
        'unit':            'bottle',
        'quantity_on_hand': 0,
        'reorder_level':   20,
        'reorder_quantity': 100,
        'unit_cost':       None,
        'supplier_name':   '',
        'supplier_contact': '',
        'is_active':       True,
    },
]


def seed_bottle_items(apps, schema_editor):
    InventoryItem = apps.get_model('inventory', 'InventoryItem')
    for data in BOTTLE_ITEMS:
        InventoryItem.objects.get_or_create(
            item_code=data['item_code'],
            defaults=data,
        )


def remove_bottle_items(apps, schema_editor):
    InventoryItem = apps.get_model('inventory', 'InventoryItem')
    InventoryItem.objects.filter(
        item_code__in=[d['item_code'] for d in BOTTLE_ITEMS]
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0001_initial'),
    ]

    operations = [
        # Update the category field choices to include 'Bottles'
        migrations.AlterField(
            model_name='inventoryitem',
            name='category',
            field=models.CharField(
                choices=[
                    ('Feed',      'Feed & Fodder'),
                    ('Medicine',  'Medicine & Supplements'),
                    ('Equipment', 'Equipment'),
                    ('Packaging', 'Packaging'),
                    ('Chemicals', 'Chemicals & Disinfectants'),
                    ('Bottles',   'Bottles'),
                    ('Other',     'Other'),
                ],
                max_length=20,
            ),
        ),
        # Seed the 6 bottle items
        migrations.RunPython(seed_bottle_items, reverse_code=remove_bottle_items),
    ]
