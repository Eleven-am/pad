#!/bin/sh

set -e

echo "=== Pad Application Startup ==="

# Database file path
DB_FILE="/app/data/pad.db"
DB_DIR="/app/data"

echo "Database file: $DB_FILE"
echo "Database directory: $DB_DIR"

# Ensure data directory exists with proper permissions
echo "Setting up data directory..."
mkdir -p "$DB_DIR"
mkdir -p "/app/public/uploads"

# Check if database exists
if [ ! -f "$DB_FILE" ]; then
    echo "Database file doesn't exist - this is a fresh installation"
    FRESH_INSTALL=true
else
    echo "Database file exists - checking migration status"
    FRESH_INSTALL=false
fi

echo "Current DATABASE_URL: $DATABASE_URL"

# For fresh installations, we need to create the database and run initial setup
if [ "$FRESH_INSTALL" = true ]; then
    echo "=== Fresh Installation Setup ==="

    echo "Creating database schema..."
    npx prisma db push --force-reset

    echo "Database setup complete for fresh installation"
else
    echo "=== Existing Installation Migration ==="

    echo "Checking for pending migrations..."

    # For existing installations, we want to be more careful
    # First, let's see the current migration status
    echo "Current migration status:"
    npx prisma migrate status || true

    echo "Applying any pending migrations..."
    npx prisma migrate deploy

    echo "Migration deployment complete"
fi

# Verify database integrity
echo "=== Database Verification ==="
echo "Verifying database connection..."

# Check database file permissions and size
if [ -f "$DB_FILE" ]; then
    DB_SIZE=$(ls -lh "$DB_FILE" | awk '{print $5}')
    echo "Database file size: $DB_SIZE"
else
    echo "ERROR: Database file was not created!"
    exit 1
fi

echo "=== Migration Complete - Starting Application ==="
echo "Starting Next.js application..."

# Start the application
exec node server.js