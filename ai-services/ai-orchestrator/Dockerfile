FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY pyproject.toml main.py ./
COPY app app
RUN pip install --no-cache-dir . && useradd --uid 10001 --create-home shopai
USER shopai
EXPOSE 8000
HEALTHCHECK --interval=20s --timeout=5s --start-period=20s CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health/ready', timeout=4)"
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--no-server-header"]
