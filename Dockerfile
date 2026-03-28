# Stage 1: Frontend Build
FROM node:20-alpine AS fe-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# Stage 2: Backend & Runtime
FROM python:3.11-slim
WORKDIR /app

# Install Node.js (for Next.js runtime)
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs libpq-dev gcc && \
    rm -rf /var/lib/apt/lists/*

# Install Backend Dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy Backend Code
COPY backend/ ./backend/

# Copy Frontend Build (Standalone)
COPY --from=fe-builder /app/frontend/.next/standalone ./frontend/
COPY --from=fe-builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=fe-builder /app/frontend/public ./frontend/public

# Environment Variables
ENV DATABASE_URL=postgresql://postgres:CrmPass2026@e8psrwqthw3mb3ish9c35c6k:5432/crm_loteamento
ENV API_INTERNAL_URL=http://localhost:8000
ENV PORT=3000
ENV NODE_ENV=production

# Startup Script
COPY start.sh .
RUN chmod +x start.sh

EXPOSE 3000
EXPOSE 8000

CMD ["./start.sh"]
