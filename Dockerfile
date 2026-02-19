# ---- base ----
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# ---- deps ----
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---- dev ----
FROM base AS dev
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV HOSTNAME=0.0.0.0
EXPOSE 3000
CMD ["pnpm", "dev", "--hostname", "0.0.0.0"]
