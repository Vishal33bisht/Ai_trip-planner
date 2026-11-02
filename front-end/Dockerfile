# ==========================================
# Build Stage
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci || npm install

COPY . .

# Build args for frontend environment variables
ARG VITE_API_BASE_URL
ARG VITE_APP_NAME="TripCraft AI"
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL:-http://localhost:8000}
ENV VITE_APP_NAME=${VITE_APP_NAME}

RUN npm run build

# ==========================================
# Production Runner Stage (NGINX)
# ==========================================
FROM nginx:1.27-alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O - http://localhost:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
