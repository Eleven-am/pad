# Docker Setup for Pad

This document explains how to run Pad using Docker and how the automated multi-architecture builds work.

## Quick Start

### Using Pre-built Images (Recommended)

Pull and run the latest multi-architecture image from GitHub Container Registry:

```bash
# Pull the latest image (supports both AMD64 and ARM64)
docker pull ghcr.io/eleven-am/pad:latest

# Run with basic setup
docker run -p 3000:3000 ghcr.io/eleven-am/pad:latest
```

### Using Docker Compose

Create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  pad:
    image: ghcr.io/eleven-am/pad:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:./database.db
    volumes:
      - pad_data:/app/prisma
    restart: unless-stopped

volumes:
  pad_data:
```

Run with:
```bash
docker compose up -d
```

## Environment Variables

The following environment variables can be configured:

- `NODE_ENV` - Set to `production` for production builds
- `DATABASE_URL` - Database connection string
- `SECRET` - Secret key for authentication
- `NEXT_PUBLIC_BASE_URL` - Base URL for the application
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GITHUB_CLIENT_ID` - GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth client secret

## Building Locally

### Development Build

```bash
# Build the Docker image locally
docker build -t pad:local .

# Run the local build
docker run -p 3000:3000 pad:local
```

### Multi-Architecture Build (requires buildx)

```bash
# Set up buildx (one-time setup)
docker buildx create --use

# Build for multiple architectures
docker buildx build --platform linux/amd64,linux/arm64 -t pad:multi-arch .
```

## Automated Builds

### GitHub Actions Workflow

The repository includes a GitHub Actions workflow (`.github/workflows/docker-publish.yml`) that automatically:

1. **Triggers on Git tags** - Only builds when you push a version tag (e.g., `v1.0.0`)
2. **Multi-architecture support** - Builds for both AMD64 and ARM64
3. **Pushes to GHCR** - Automatically publishes to GitHub Container Registry
4. **Smart tagging** - Creates multiple tags (`latest`, `1.0.0`, `1.0`, `1`)
5. **Caching** - Uses GitHub Actions cache for faster builds
6. **Security** - Generates SBOM and provenance attestations

### Creating a Release

To trigger a new Docker build and release:

```bash
# Tag your commit with a semantic version
git tag v1.0.0
git push origin v1.0.0
```

This will automatically:
- Build multi-arch Docker images
- Push to `ghcr.io/eleven-am/pad:1.0.0`
- Update the `latest` tag
- Generate security attestations

### Available Tags

After a release, the following tags are available:

- `ghcr.io/eleven-am/pad:latest` - Latest stable release
- `ghcr.io/eleven-am/pad:1.0.0` - Specific version
- `ghcr.io/eleven-am/pad:1.0` - Major.minor version
- `ghcr.io/eleven-am/pad:1` - Major version

## Architecture Support

The Docker images support the following architectures:

- **linux/amd64** - Standard x86_64 (Intel/AMD processors)
- **linux/arm64** - ARM 64-bit (Apple Silicon, AWS Graviton, etc.)

Docker will automatically pull the correct architecture for your platform.

## Health Check

The container includes a built-in health check that monitors:
- Application responsiveness
- Basic API functionality
- Container uptime

Check container health:
```bash
docker ps  # Look for "healthy" status
```

## Security

The Docker image follows security best practices:

- **Non-root user** - Runs as `nextjs` user (UID 1001)
- **Minimal base image** - Based on Alpine Linux
- **No secrets in image** - All sensitive data via environment variables
- **SBOM included** - Software Bill of Materials for security scanning
- **Provenance attestations** - Build provenance for supply chain security

## Troubleshooting

### Container won't start
```bash
# Check logs
docker logs <container-id>

# Check health
docker inspect <container-id> | grep Health
```

### Performance issues
- Ensure adequate CPU and memory allocation
- Check if you're running the correct architecture image
- Monitor disk space for database growth

### Database issues
```bash
# Run Prisma migrations in the container
docker exec -it <container-id> npx prisma migrate deploy

# Reset database (WARNING: destroys data)
docker exec -it <container-id> npx prisma migrate reset --force
```

## Development

For development with Docker:

```bash
# Build development image
docker build --target builder -t pad:dev .

# Run with volume mounts for development
docker run -v $(pwd):/app -p 3000:3000 pad:dev npm run dev
```