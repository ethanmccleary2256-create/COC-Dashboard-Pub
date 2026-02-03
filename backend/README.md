# Backend (COC Proxy)

This small FastAPI app proxies selected Clash of Clans API endpoints without using the `coc.py` library.

## Setup

1. Create a virtualenv and install requirements:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

2. Set the Clash of Clans API token in environment variable `COC_API_TOKEN`.

On Windows (PowerShell):

```powershell
$env:COC_API_TOKEN = "YOUR_TOKEN_HERE"
```

Optionally set `FRONTEND_ORIGINS` to a comma-separated list of allowed origins (default is `*`).

## Run

```bash
uvicorn backend.main:app --reload --port 8000
```

## Endpoints

- `GET /clan/{tag}` - get clan info by tag (tag may include or omit the leading `#`).
- `GET /player/{tag}` - get player info by tag (tag may include or omit the leading `#`).

Example:

```bash
curl http://localhost:8000/clan/%23CLANTAG
# or
curl http://localhost:8000/clan/CLANTAG
```

Replace `CLANTAG` with the actual tag (without the `#` or with it). The server will URL-encode it appropriately.
