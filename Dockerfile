# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy prisma schema for generation
COPY prisma ./prisma

# Generate Prisma client
RUN pnpm exec prisma generate

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Production stage
FROM node:20-alpine AS production

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy prisma schema
COPY prisma ./prisma

# Generate Prisma client
RUN pnpm exec prisma generate

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Expose application port
EXPOSE 4000

# Start the application
CMD ["node", "dist/main"]
