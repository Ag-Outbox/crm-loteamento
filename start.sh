#!/bin/bash

# Inicia o Backend em background
echo "--- Debug: Pip List ---"
pip list
echo "-----------------------"

echo "Iniciando Backend (FastAPI)..."
cd /app/backend
uvicorn main:app --host 0.0.0.0 --port 8000 &

# Inicia o Frontend (Next.js)
echo "Iniciando Frontend (Next.js)..."
cd /app/frontend
node server.js
