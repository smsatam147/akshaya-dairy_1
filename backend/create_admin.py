"""
Auto-run during Render deployment to create the default admin user.
"""
import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dairypro.settings')
django.setup()

from dairypro.core.models import User

if not User.objects.filter(email='admin@dairypro.com').exists():
    User.objects.create_superuser(
        email='admin@dairypro.com',
        password='Admin@123',
        full_name='Admin',
        role='super_admin'
    )
    print('SUCCESS: Admin user created.')
else:
    print('INFO: Admin user already exists.')
