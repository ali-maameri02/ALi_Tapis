FROM python:3.12

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --upgrade pip
COPY requirements.txt .
RUN pip install -r requirements.txt gunicorn  # Explicitly install gunicorn
RUN pip install -r requirements.txt django-colorfield  # Explicitly install gunicorn
WORKDIR /app
COPY . .

EXPOSE 8000
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "ecommerce.wsgi:application"]