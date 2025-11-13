#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

# Run the database wait script
python /app/wait_for_db.py

# Execute the main command (passed from CMD in Dockerfile)
exec "$@"
