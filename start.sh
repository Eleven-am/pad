#!/bin/sh

set -e

echo "=== Pad Application Startup ==="

# Database file path
DB_FILE="/app/data/pad.db"
DB_DIR="/app/data"

echo "Database file: $DB_FILE"
echo "Database directory: $DB_DIR"

# Ensure data directory exists
echo "Setting up data directory..."
mkdir -p "$DB_DIR"
mkdir -p "/app/public/uploads"

echo "Current DATABASE_URL: $DATABASE_URL"

# Always use db push for SQLite - simpler and more reliable
echo "=== Database Schema Sync ==="
echo "Syncing database schema with Prisma..."

if [ ! -f "$DB_FILE" ]; then
    echo "Fresh database - creating schema..."
    npx prisma db push
else
    echo "Existing database - updating schema if needed..."
    npx prisma db push
fi

echo "Schema sync complete"

# Verify database integrity
echo "=== Database Verification ==="
if [ -f "$DB_FILE" ]; then
    DB_SIZE=$(ls -lh "$DB_FILE" | awk '{print $5}')
    echo "Database file size: $DB_SIZE"
    echo "Database ready"
else
    echo "ERROR: Database file was not created!"
    exit 1
fi

echo "=== Starting Application ==="
echo "Starting Next.js application..."

# Start the application
exec node server.js
