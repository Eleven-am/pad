#!/bin/sh
set -e

# If running migrations, do that and exit
if [ "$1" = "migrate" ]; then
    echo "🔄 Running database migrations..."
    npx prisma migrate deploy
    echo "🌱 Initializing database..."
    node scripts/db-init.js
    echo "✅ Migration completed"
    exit 0
fi

# Otherwise, start the application
echo "🚀 Starting Pad application..."
export HOSTNAME="0.0.0.0"
exec "$@"