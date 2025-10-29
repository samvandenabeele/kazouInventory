FROM python:3.11-slim
WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip to latest secure version
RUN pip install --no-cache-dir --upgrade pip

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY . .

# Expose port
EXPOSE 5000

RUN chmod +x ./entrypoint.sh

ENTRYPOINT [ "sh", "./entrypoint.sh" ]

# Use gunicorn to serve the Flask app factory
# Gunicorn will call create_app via module:callable pattern
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:create_app()"]