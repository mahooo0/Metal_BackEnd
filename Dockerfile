FROM node:20-alpine

# Install dependencies for Prisma on Alpine
RUN apk add --no-cache openssl libc6-compat

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy prisma schema
COPY prisma ./prisma

# Generate Prisma client
RUN pnpm exec prisma generate

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Expose port
EXPOSE 4000

# Start application
CMD ["node", "dist/main"]
