"""
Router para o Stand Online - configurações da vitrine digital do loteamento.
Agora suporta múltiplos stands salvos no banco de dados.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional, List
import os
import shutil
import uuid
import json

from database import get_db
import models
import schemas.stand as schemas

router = APIRouter(prefix="/api/stand", tags=["Stand Online"])

# Diretório para armazenar uploads de imagens
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

DEFAULT_CONFIG_VALUES = {
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

# ─── Endpoints Administrativos ──────────────────────────────────────────────

@router.get("/list", response_model=List[schemas.StandResponse])
async def list_stands(db: Session = Depends(get_db)):
    """Lista todos os stands criados no tenant."""
    # Para o MVP, estamos usando tenant_id = 1
    return db.query(models.stand.Stand).filter(models.stand.Stand.tenant_id == 1).all()


@router.post("/create", response_model=schemas.StandResponse)
async def create_stand(
    name: str = Form(...),
    development_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    """Cria um novo stand com configurações padrão."""
    config = DEFAULT_CONFIG_VALUES.copy()
    if development_id:
        dev = db.query(models.units.Development).filter(models.units.Development.id == development_id).first()
        if dev:
            config["nome_empreendimento"] = dev.name

    new_stand = models.stand.Stand(
        tenant_id=1,
        development_id=development_id,
        name=name,
        config=config,
        is_active=True
    )
    db.add(new_stand)
    db.commit()
    db.refresh(new_stand)
    return new_stand


@router.get("/{uuid_str}", response_model=schemas.StandResponse)
async def get_stand(uuid_str: str, db: Session = Depends(get_db)):
    """Busca um stand específico pelo UUID."""
    stand = db.query(models.stand.Stand).filter(models.stand.Stand.uuid == uuid_str).first()
    if not stand:
        raise HTTPException(status_code=404, detail="Stand não encontrado.")
    return stand


@router.post("/{uuid_str}/config")
async def update_stand_config(
    uuid_str: str,
    nome_empreendimento: Optional[str] = Form(None),
    slogan: Optional[str] = Form(None),
    descricao: Optional[str] = Form(None),
    cor_primaria: Optional[str] = Form(None),
    template: Optional[str] = Form(None),
    stats_vendido: Optional[str] = Form(None),
    stats_total_lotes: Optional[str] = Form(None),
    stats_area_minima: Optional[str] = Form(None),
    development_id: Optional[int] = Form(None),
    diferenciais: Optional[str] = Form(None),
    plugins: Optional[str] = Form(None),
    publicado: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """Atualiza as configurações de um stand específico."""
    stand = db.query(models.stand.Stand).filter(models.stand.Stand.uuid == uuid_str).first()
    if not stand:
        raise HTTPException(status_code=404, detail="Stand não encontrado.")

    config = dict(stand.config)

    if nome_empreendimento is not None: config["nome_empreendimento"] = nome_empreendimento
    if slogan is not None: config["slogan"] = slogan
    if descricao is not None: config["descricao"] = descricao
    if cor_primaria is not None: config["cor_primaria"] = cor_primaria
    if template is not None: config["template"] = template
    if stats_vendido is not None: config["stats_vendido"] = stats_vendido
    if stats_total_lotes is not None: config["stats_total_lotes"] = stats_total_lotes
    if stats_area_minima is not None: config["stats_area_minima"] = stats_area_minima
    if development_id is not None: stand.development_id = development_id
    
    if diferenciais is not None:
        try: config["diferenciais"] = json.loads(diferenciais)
        except: pass
    if plugins is not None:
        try: config["plugins"] = json.loads(plugins)
        except: pass
    if publicado is not None:
        config["publicado"] = publicado.lower() == "true"
        stand.is_active = config["publicado"]

    stand.config = config
    db.commit()
    return {"status": "ok", "stand": stand}


@router.delete("/{uuid_str}")
async def delete_stand(uuid_str: str, db: Session = Depends(get_db)):
    """Exclui um stand."""
    stand = db.query(models.stand.Stand).filter(models.stand.Stand.uuid == uuid_str).first()
    if not stand:
        raise HTTPException(status_code=404, detail="Stand não encontrado.")
    db.delete(stand)
    db.commit()
    return {"status": "ok"}

# ─── Endpoints de Upload (Específicos por Stand) ───────────────────────────

@router.post("/{uuid_str}/upload/hero-image")
async def upload_hero_image(uuid_str: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    stand = db.query(models.stand.Stand).filter(models.stand.Stand.uuid == uuid_str).first()
    if not stand: raise HTTPException(status_code=404, detail="Stand não encontrado.")

    allowed = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Tipo de arquivo não permitido.")

    ext = file.filename.split(".")[-1].lower()
    filename = f"hero_{uuid_str}_{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(UPLOADS_DIR, filename)

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    url = f"/api/stand/uploads/{filename}"
    config = dict(stand.config)
    config["hero_image_url"] = url
    stand.config = config
    db.commit()

    return {"status": "ok", "url": url}


@router.post("/{uuid_str}/upload/map-image")
async def upload_map_image(uuid_str: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    stand = db.query(models.stand.Stand).filter(models.stand.Stand.uuid == uuid_str).first()
    if not stand: raise HTTPException(status_code=404, detail="Stand não encontrado.")

    allowed = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Tipo de arquivo não permitido.")

    ext = file.filename.split(".")[-1].lower()
    filename = f"map_{uuid_str}_{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(UPLOADS_DIR, filename)

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    url = f"/api/stand/uploads/{filename}"
    config = dict(stand.config)
    config["map_image_url"] = url
    stand.config = config
    db.commit()

    return {"status": "ok", "url": url}


# ─── Endpoints Públicos (Visualização do Stand) ────────────────────────────

@router.get("/v/{uuid_str}/units")
async def get_stand_units(uuid_str: str, db: Session = Depends(get_db)):
    """Retorna as unidades do loteamento associado a este stand específico."""
    stand = db.query(models.stand.Stand).filter(models.stand.Stand.uuid == uuid_str).first()
    if not stand or not stand.development_id:
        return []

    units = db.query(models.Unit).join(models.Block).filter(
        models.Block.development_id == stand.development_id
    ).all()
    
    return [
        {
            "id": u.id,
            "number": u.number,
            "status": u.status,
            "price": u.price,
            "area_m2": u.area_m2,
            "map_x": u.map_x,
            "map_y": u.map_y,
            "block_name": u.block.name
        }
        for u in units
    ]

@router.get("/uploads/{filename}")
async def serve_upload(filename: str):
    """Serve os arquivos de upload do stand."""
    file_path = os.path.join(UPLOADS_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Arquivo não encontrado.")
    return FileResponse(file_path)
