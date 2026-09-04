FROM python:3.13-slim

WORKDIR /app

# Copy entire repo to preserve full context (data/, imports, etc.)
COPY . .

# Install backend package with all dependencies from pyproject.toml
RUN pip install --no-cache-dir -e ./backend

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "app.main:app", "--app-dir", "backend", "--host", "0.0.0.0", "--port", "8000"]

