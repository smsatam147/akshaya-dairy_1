"""
Data migration: one-time removal of all synthetic/demo Employee Roster data.

Clears employees, attendance and payroll (in FK-safe order) so the Employee
Roster tab starts empty. Runs once on deploy; real data added later is untouched.
"""
from django.db import migrations


def clear_employee_data(apps, schema_editor):
    AttendanceRecord = apps.get_model('hr', 'AttendanceRecord')
    PayrollLine = apps.get_model('hr', 'PayrollLine')
    PayrollRun = apps.get_model('hr', 'PayrollRun')
    Employee = apps.get_model('hr', 'Employee')

    # PayrollLine -> Employee is PROTECT, so remove payroll first.
    PayrollLine.objects.all().delete()
    PayrollRun.objects.all().delete()
    AttendanceRecord.objects.all().delete()
    Employee.objects.all().delete()


def noop(apps, schema_editor):
    # Irreversible: deleted demo data cannot be restored.
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('hr', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(clear_employee_data, noop),
    ]
