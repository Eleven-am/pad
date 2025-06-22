#!/bin/sh
set -e

echo "🔧 Initializing Pad..."

echo "1️⃣ Generating Prisma Client..."
npx prisma generate

echo "2️⃣ Ensuring database schema is up to date..."
npx prisma db push --skip-generate

echo "3️⃣ Initializing database..."
node scripts/db-init.js

echo "4️⃣ Starting server..."
exec node server.js