# Build stage for client
FROM node:20-alpine AS client-builder
WORKDIR /client
COPY client/package*.json ./
RUN npm ci
COPY client/ .
RUN npm run build:server

# Python stage
FROM python:3.11-slim
WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip to latest secure version
RUN pip install --no-cache-dir --upgrade pip

# Copy requirements and install
COPY server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy server app
COPY server/ .

# Copy built client from builder stage
COPY --from=client-builder /client/dist .server/www

# Expose port
EXPOSE 5000

COPY entrypoint.sh .
RUN chmod +x ./entrypoint.sh


ENTRYPOINT [ "sh", "./entrypoint.sh" ]

# Use gunicorn to serve the Flask app factory
# Gunicorn will call create_app via module:callable pattern
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--access-logfile", "-", "--error-logfile", "-", "--log-level", "info", "app:create_app()"]