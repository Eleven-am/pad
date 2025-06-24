# syntax=docker.io/docker/dockerfile:1

FROM node:18-alpine AS base

# 1. Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i; \
  else echo "Lockfile not found." && exit 1; \
  fi

# 2. Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client before building
RUN npx prisma generate

# Now build the application
RUN npm run build

# 3. Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy Prisma files and schema for migrations
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Create startup script that handles migrations and app startup
RUN cat > start.sh << 'EOF'
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
EOF

# Make the script executable
RUN chmod +x start.sh

# Ensure proper ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use the startup script as the main command
CMD ["./start.sh"]
