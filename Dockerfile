FROM python:3.11-slim

WORKDIR /app

# Copy dependency requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files (JSON array format required for paths with spaces)
COPY ["Idea Lab Frontend/Idea Lab", "./"]

# Render exposes dynamic PORT environment variable (defaults to 10000)
ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
