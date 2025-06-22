# Multi-stage Dockerfile optimized for Next.js 15 with Prisma
# Supports both AMD64 and ARM64 architectures

# Stage 1: Base image with Node.js
FROM node:20-alpine AS base

# Install dependencies for all architectures
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Stage 2: Install dependencies
FROM base AS deps

# Install dependencies based on the preferred package manager
RUN \
  if [ -f package-lock.json ]; then npm ci --omit=dev; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Stage 3: Build the application
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
# Next.js collects telemetry data, disable it in production
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Stage 4: Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public

# Set permissions for prerendered cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy built application with proper permissions
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma client and schema
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Copy database initialization script
COPY --from=builder --chown=nextjs:nodejs /app/scripts/db-init.js ./scripts/db-init.js
COPY --from=builder --chown=nextjs:nodejs /app/src/generated/prisma ./src/generated/prisma

# Set build-time arguments (populated by GitHub Actions)
ARG BUILDTIME
ARG VERSION
ARG REVISION

# Add metadata labels
LABEL org.opencontainers.image.title="Pad"
LABEL org.opencontainers.image.description="Professional-grade, block-based content management and blogging platform"
LABEL org.opencontainers.image.created="${BUILDTIME}"
LABEL org.opencontainers.image.version="${VERSION}"
LABEL org.opencontainers.image.revision="${REVISION}"
LABEL org.opencontainers.image.vendor="Roy OSSAI"
LABEL org.opencontainers.image.licenses="GPL-3.0"

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set hostname to localhost
ENV HOSTNAME "0.0.0.0"
ENV PORT 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Create entrypoint script
RUN echo '#!/bin/sh\n\
set -e\n\
echo "🔧 Initializing Pad..."\n\
echo "1️⃣ Generating Prisma Client..."\n\
npx prisma generate\n\
echo "2️⃣ Ensuring database schema is up to date..."\n\
npx prisma db push --skip-generate\n\
echo "3️⃣ Initializing database..."\n\
node scripts/db-init.js\n\
echo "4️⃣ Starting server..."\n\
exec node server.js' > /app/docker-entrypoint.sh && \
    chmod +x /app/docker-entrypoint.sh

# Start the application with database initialization
CMD ["/app/docker-entrypoint.sh"]