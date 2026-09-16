#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "Installing backend dependencies..."
pip install -r requirements.txt

echo "Collecting static assets..."
python manage.py collectstatic --no-input

echo "Running database schema migrations..."
python manage.py migrate --no-input

echo "Celarox Enterprise Backend build complete."
