# bookworm-slim (glibc): npm ci is flaky on Alpine with "Exit handler never called" (npm/cli#4828 area).
FROM node:22-bookworm-slim AS build
WORKDIR /app

ENV CI=true

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

