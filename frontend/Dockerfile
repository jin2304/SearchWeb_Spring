FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.30.1 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
ENV NEXT_OUTPUT_EXPORT=true
RUN pnpm build

FROM nginx:alpine

COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 80 443
