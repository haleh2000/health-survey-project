FROM python:3.11-slim

WORKDIR /app

ENV PIP_DEFAULT_TIMEOUT=45 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# pypi.org is blocked/slow on some networks and public mirrors come and go
# (quota errors, 402/403). The install below walks this list and uses the
# first index that works. Put a preferred index first via PIP_INDEX_URL.
ARG PIP_INDEX_URL=
ARG PIP_FALLBACK_INDEXES="https://pypi.org/simple https://pypi.tuna.tsinghua.edu.cn/simple https://pypi.mirrors.ustc.edu.cn/simple https://mirror-pypi.runflare.com/simple"

COPY requirements.txt .

RUN set -e; \
    for idx in $PIP_INDEX_URL $PIP_FALLBACK_INDEXES; do \
        echo ">>> trying index: $idx"; \
        if pip install --no-cache-dir --retries 1 -i "$idx" -r requirements.txt; then \
            echo ">>> installed from $idx"; exit 0; \
        fi; \
        echo ">>> failed: $idx"; \
    done; \
    echo "!!! no PyPI index reachable"; exit 1

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
