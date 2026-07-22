#!/usr/bin/env bash
# Render runs this as the build step (Build Command).
# Everything here is idempotent — safe to run on every deploy, which matters
# because the free tier has no Shell access to run one-off commands manually.
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --noinput
python manage.py migrate
python manage.py seed_content
python manage.py create_admin
