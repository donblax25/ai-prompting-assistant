# ---- Base Image ----
FROM node:20-alpine AS base
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# ---- Builder ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client (Ensure you move to PostgreSQL before full prod)
RUN npx prisma generate

# ---- Runner ----
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 5000

# Copy necessary files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma

EXPOSE 5000

# Start server
CMD ["npm", "start"]
