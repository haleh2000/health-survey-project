FROM python:3.11-slim

WORKDIR /app

# pypi.org is not reachable from every network; override with a mirror, e.g.
#   PIP_INDEX_URL=https://mirror-pypi.runflare.com/simple
ARG PIP_INDEX_URL=https://pypi.org/simple
ENV PIP_INDEX_URL=${PIP_INDEX_URL} \
    PIP_DEFAULT_TIMEOUT=60

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
