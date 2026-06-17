"""
clear_data.py — Wipes all synthetic/demo data from DairyPro 360.
Keeps: user accounts (admin, manager, etc.)
Clears: cattle, milk, health, inventory, sales, employees, finance entries

Run via: python manage.py shell < clear_data.py
"""
import django
django.setup()

print("=" * 55)
print("  DairyPro 360 — Clearing All Synthetic Data")
print("=" * 55)

# ── Finance ───────────────────────────────────────────────────
from dairypro.finance.models import JournalLine, JournalEntry, Account
n = JournalLine.objects.all().delete()[0]
print(f"  Deleted {n} journal lines")
n = JournalEntry.objects.all().delete()[0]
print(f"  Deleted {n} journal entries")
n = Account.objects.all().delete()[0]
print(f"  Deleted {n} accounts")

# ── HR ────────────────────────────────────────────────────────
from dairypro.hr.models import AttendanceRecord, PayrollRun, Employee
n = AttendanceRecord.objects.all().delete()[0]
print(f"  Deleted {n} attendance records")
try:
    n = PayrollRun.objects.all().delete()[0]
    print(f"  Deleted {n} payroll runs")
except Exception:
    pass
n = Employee.objects.all().delete()[0]
print(f"  Deleted {n} employees")

# ── Sales ─────────────────────────────────────────────────────
from dairypro.sales.models import Invoice, OrderLine, SalesOrder, Customer
n = Invoice.objects.all().delete()[0]
print(f"  Deleted {n} invoices")
n = OrderLine.objects.all().delete()[0]
print(f"  Deleted {n} order lines")
n = SalesOrder.objects.all().delete()[0]
print(f"  Deleted {n} sales orders")
n = Customer.objects.all().delete()[0]
print(f"  Deleted {n} customers")

# ── Inventory ─────────────────────────────────────────────────
from dairypro.inventory.models import StockTransaction, InventoryItem
n = StockTransaction.objects.all().delete()[0]
print(f"  Deleted {n} stock transactions")
n = InventoryItem.objects.all().delete()[0]
print(f"  Deleted {n} inventory items")

# ── Milk ──────────────────────────────────────────────────────
from dairypro.milk.models import MilkCollection
n = MilkCollection.objects.all().delete()[0]
print(f"  Deleted {n} milk collection records")

# ── Cattle ────────────────────────────────────────────────────
from dairypro.cattle.models import BreedingRecord, Vaccination, HealthRecord, Cattle
n = BreedingRecord.objects.all().delete()[0]
print(f"  Deleted {n} breeding records")
n = Vaccination.objects.all().delete()[0]
print(f"  Deleted {n} vaccination records")
n = HealthRecord.objects.all().delete()[0]
print(f"  Deleted {n} health records")
n = Cattle.objects.all().delete()[0]
print(f"  Deleted {n} cattle")

print()
print("=" * 55)
print("  Done! Database is clean.")
print("  User accounts have been kept.")
print("  Refresh http://localhost:3000 — app is ready for real data.")
print("=" * 55)
