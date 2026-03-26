"""
Router para o Stand Online - configurações da vitrine digital do loteamento.
Inclui upload de imagem do mapa, personalização e configurações gerais.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import os
import shutil
import uuid
import json

from database import get_db
import models

router = APIRouter(prefix="/api/stand", tags=["Stand Online"])

# Diretório para armazenar uploads de imagens
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

# Arquivo de configurações do stand (simples JSON para persistência sem nova tabela)
STAND_CONFIG_FILE = os.path.join(os.path.dirname(__file__), "..", "stand_config.json")

def get_stand_config() -> dict:
    """Lê a configuração do stand do arquivo JSON."""
    if os.path.exists(STAND_CONFIG_FILE):
        with open(STAND_CONFIG_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "nome_empreendimento": "Reserva das Flores",
        "slogan": "Onde a natureza e o design se encontram.",
        "descricao": "Lotes a partir de 250m² com infraestrutura de lazer completa e segurança 24h para sua família.",
        "cor_primaria": "#4f46e5",
        "template": "premium",
        "hero_image_url": None,
        "map_image_url": None,
        "diferenciais": ["Quadra de Tênis", "Portais Monumentais", "Ciclovias", "Rede de Esgoto Própria"],
        "stats_vendido": "85",
        "stats_total_lotes": "120",
        "stats_area_minima": "250m²",
        "publicado": True,
        "plugins": {
            "mapa_interativo": True,
            "simulador_financeiro": True,
            "tour_virtual": False
        }
    }

def save_stand_config(config: dict):
    """Salva a configuração do stand no arquivo JSON."""
    with open(STAND_CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(config, f, ensure_ascii=False, indent=2)


# ─── Endpoints ──────────────────────────────────────────────────────────────

@router.get("/config")
async def get_config():
    """Retorna as configurações atuais do Stand Online."""
    return get_stand_config()


@router.post("/config")
async def update_config(
    nome_empreendimento: Optional[str] = Form(None),
    slogan: Optional[str] = Form(None),
    descricao: Optional[str] = Form(None),
    cor_primaria: Optional[str] = Form(None),
    template: Optional[str] = Form(None),
    stats_vendido: Optional[str] = Form(None),
    stats_total_lotes: Optional[str] = Form(None),
    stats_area_minima: Optional[str] = Form(None),
    diferenciais: Optional[str] = Form(None),  # JSON string
    plugins: Optional[str] = Form(None),  # JSON string
    publicado: Optional[str] = Form(None),
):
    """Atualiza as configurações do Stand Online."""
    config = get_stand_config()

    if nome_empreendimento is not None:
        config["nome_empreendimento"] = nome_empreendimento
    if slogan is not None:
        config["slogan"] = slogan
    if descricao is not None:
        config["descricao"] = descricao
    if cor_primaria is not None:
        config["cor_primaria"] = cor_primaria
    if template is not None:
        config["template"] = template
    if stats_vendido is not None:
        config["stats_vendido"] = stats_vendido
    if stats_total_lotes is not None:
        config["stats_total_lotes"] = stats_total_lotes
    if stats_area_minima is not None:
        config["stats_area_minima"] = stats_area_minima
    if diferenciais is not None:
        try:
            config["diferenciais"] = json.loads(diferenciais)
        except Exception:
            pass
    if plugins is not None:
        try:
            config["plugins"] = json.loads(plugins)
        except Exception:
            pass
    if publicado is not None:
        config["publicado"] = publicado.lower() == "true"

    save_stand_config(config)
    return {"status": "ok", "config": config}


@router.post("/upload/hero-image")
async def upload_hero_image(file: UploadFile = File(...)):
    """
    Faz upload da imagem principal (hero) do Stand Online.
    Aceita: JPG, PNG, WEBP.
    """
    allowed = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
    if file.content_type not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de arquivo não permitido: {file.content_type}. Use JPG, PNG ou WEBP."
        )

    ext = file.filename.split(".")[-1].lower()
    filename = f"hero_{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(UPLOADS_DIR, filename)

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    url = f"/api/stand/uploads/{filename}"

    # Atualiza a config com a nova URL
    config = get_stand_config()
    config["hero_image_url"] = url
    save_stand_config(config)

    return {"status": "ok", "url": url, "filename": filename}


@router.post("/upload/map-image")
async def upload_map_image(file: UploadFile = File(...)):
    """
    Faz upload da imagem do mapa/planta do loteamento para o Stand Online.
    Aceita: JPG, PNG, WEBP.
    """
    allowed = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
    if file.content_type not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de arquivo não permitido: {file.content_type}. Use JPG, PNG ou WEBP."
        )

    ext = file.filename.split(".")[-1].lower()
    filename = f"stand_map_{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(UPLOADS_DIR, filename)

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    url = f"/api/stand/uploads/{filename}"

    # Atualiza a config com a nova URL
    config = get_stand_config()
    config["map_image_url"] = url
    save_stand_config(config)

    return {"status": "ok", "url": url, "filename": filename}


@router.get("/uploads/{filename}")
async def serve_upload(filename: str):
    """Serve os arquivos de upload do stand."""
    file_path = os.path.join(UPLOADS_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Arquivo não encontrado.")
    return FileResponse(file_path)


@router.delete("/upload/hero-image")
async def remove_hero_image():
    """Remove a imagem hero, voltando para a imagem padrão."""
    config = get_stand_config()
    # Remove o arquivo físico se existir
    if config.get("hero_image_url"):
        filename = config["hero_image_url"].split("/")[-1]
        file_path = os.path.join(UPLOADS_DIR, filename)
        if os.path.exists(file_path):
            os.remove(file_path)
    config["hero_image_url"] = None
    save_stand_config(config)
    return {"status": "ok"}


@router.delete("/upload/map-image")
async def remove_map_image():
    """Remove a imagem do mapa, voltando para o padrão."""
    config = get_stand_config()
    if config.get("map_image_url"):
        filename = config["map_image_url"].split("/")[-1]
        file_path = os.path.join(UPLOADS_DIR, filename)
        if os.path.exists(file_path):
            os.remove(file_path)
    config["map_image_url"] = None
    save_stand_config(config)
    return {"status": "ok"}
