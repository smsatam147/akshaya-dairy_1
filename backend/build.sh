#!/usr/bin/env bash
# Render build script — runs on every deploy
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate

# Create default superuser if not exists
python manage.py shell -c "
from dairypro.core.models import User
if not User.objects.filter(email='admin@dairypro.com').exists():
    User.objects.create_superuser(email='admin@dairypro.com', password='Admin@123', full_name='Admin', role='super_admin')
    print('Superuser created')
else:
    print('Superuser already exists')
"
