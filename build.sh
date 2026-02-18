#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt

# Collect static files for WhiteNoise
python manage.py collectstatic --no-input

# Run migrations (PostgreSQL tables will be created here)
python manage.py migrate