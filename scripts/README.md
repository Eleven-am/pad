# Scripts Directory

This directory contains utility scripts for Pad.

## Available Scripts

### db-init.js
Initializes the database with required default data, specifically:
- Creates default site configuration if it doesn't exist
- Ensures the app can start even with a fresh database

**Usage:**
```bash
node scripts/db-init.js
```

### start-with-init.js
Starts the application with automatic database initialization:
1. Generates Prisma client
2. Pushes database schema
3. Initializes database with defaults
4. Starts Next.js server

**Usage:**
```bash
# Development
npm run dev:init

# Production
npm run start:init
```

## Docker Integration

The `db-init.js` script is automatically run when starting the Docker container to ensure the database is properly initialized before the app starts.