# Docker Database Behavior

## What Happens When You Start Pad with Docker Compose

When a user runs `docker-compose up` with Pad, this is the complete startup sequence:

### 1. Container Starts
The Docker container starts and runs the entrypoint script (`/app/docker-entrypoint.sh`).

### 2. Prisma Client Generation
```
🔧 Initializing Pad...
1️⃣ Generating Prisma Client...
```
- Generates the Prisma client from the schema
- This ensures the ORM is ready to interact with the database

### 3. Database Schema Creation/Update
```
2️⃣ Ensuring database schema is up to date...
```
- Runs `prisma db push --skip-generate`
- If the database file doesn't exist (first run), it creates a new SQLite database
- Creates all tables defined in the Prisma schema
- If database exists, it updates the schema to match the current version

### 4. Database Initialization
```
3️⃣ Initializing database...
```
- Runs the `db-init.js` script
- Checks if a SiteConfig record exists
- If not (fresh database), creates default site configuration:
  - Site name: "Pad"
  - Default navigation links
  - Privacy and Terms links in footer
  - Basic settings (comments enabled, registration enabled)

### 5. Server Starts
```
4️⃣ Starting server...
```
- Starts the Next.js production server
- App is now ready to accept connections

## Database Persistence

### With Docker Compose (Recommended)
```yaml
volumes:
  - pad_data:/app/data  # Database persists across container restarts
```
- Database is stored in a Docker volume
- Survives container restarts and updates
- Data persists until you explicitly remove the volume

### Without Volume Mapping
```yaml
# ⚠️ WARNING: Data will be lost when container stops!
environment:
  - DATABASE_URL=file:./prisma/pad.db
```
- Database exists only inside the container
- Lost when container is removed
- Only suitable for testing

## Multiple Database Scenarios

### 1. Fresh Install (No Database)
- Creates new SQLite database file
- Runs all migrations to create tables
- Initializes with default site configuration
- Ready to use immediately

### 2. Existing Database (Upgrade)
- Detects existing database
- Updates schema if needed
- Preserves all existing data
- Skips initialization (config already exists)

### 3. Corrupted/Partial Database
- Attempts to repair schema
- May fail if corruption is severe
- Recommendation: Backup before upgrades

## Database Location Examples

### SQLite (Default)
```yaml
environment:
  - DATABASE_URL=file:/app/data/pad.db
volumes:
  - ./data:/app/data  # Maps to host filesystem
```

### PostgreSQL
```yaml
services:
  pad:
    environment:
      - DATABASE_URL=postgresql://user:password@postgres:5432/pad
    depends_on:
      - postgres
  
  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=pad
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

### MySQL/MariaDB
```yaml
services:
  pad:
    environment:
      - DATABASE_URL=mysql://user:password@mariadb:3306/pad
    depends_on:
      - mariadb
  
  mariadb:
    image: mariadb:11
    environment:
      - MYSQL_ROOT_PASSWORD=rootpass
      - MYSQL_DATABASE=pad
      - MYSQL_USER=user
      - MYSQL_PASSWORD=password
    volumes:
      - mariadb_data:/var/lib/mysql
```

## Troubleshooting

### Container keeps restarting
Check logs: `docker-compose logs pad`

Common issues:
- Invalid DATABASE_URL
- Permissions on volume
- Corrupted database file

### Database not persisting
Ensure you have a volume mapped:
```yaml
volumes:
  - pad_data:/app/data  # Named volume
  # OR
  - ./data:/app/data    # Host directory
```

### Reset database
```bash
# Stop containers
docker-compose down

# Remove volume (WARNING: Deletes all data!)
docker volume rm yourproject_pad_data

# Start fresh
docker-compose up
```

### Manual database initialization
```bash
# Enter container
docker-compose exec pad sh

# Run initialization
node scripts/db-init.js
```

## Best Practices

1. **Always use volumes** for data persistence
2. **Backup regularly** before updates
3. **Test upgrades** in staging first
4. **Monitor logs** during startup
5. **Use PostgreSQL** for production deployments with multiple instances

## Environment Variables

### Required
- `DATABASE_URL` - Database connection string

### Recommended
- `SECRET` - Session encryption key (generate a random string)
- `NEXT_PUBLIC_BASE_URL` - Public URL of your instance

### Optional
- Google/GitHub OAuth credentials
- Analytics IDs
- Email configuration