from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import os

from database import get_db
import models
import schemas.units as schemas
from routers.auth import get_current_user, check_role
from ai_utils import detect_lots_in_image

router = APIRouter(prefix="/api/maps", tags=["Interactive Maps"])

@router.post("/detect-lots")
async def detect_lots_from_image(
    file: UploadFile = File(...),
    current_user: models.User = Depends(check_role([models.UserRole.ADMIN, models.UserRole.SUPER_ADMIN]))
):
    """
    Recebe uma imagem da planta e retorna as coordenadas (x, y) de cada lote detectado pela IA.
    """
    contents = await file.read()
    coords = detect_lots_in_image(contents)
    
    return {
        "count": len(coords),
        "detected_markers": [{"x": x, "y": y} for x, y in coords]
    }

@router.post("/save-markers/{development_id}")
async def save_map_markers(
    development_id: int,
    markers: List[schemas.UnitBase], # Usando o próprio schema de Unit para criar/atualizar
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role([models.UserRole.ADMIN, models.UserRole.SUPER_ADMIN]))
):
    """
    Salva ou atualiza os lotes (markers) projetados no mapa.
    """
    dev = db.query(models.Development).filter(
        models.Development.id == development_id, 
        models.Development.tenant_id == current_user.tenant_id
    ).first()
    
    if not dev:
        raise HTTPException(status_code=404, detail="Empreendimento não encontrado.")
    
    # Nota: Em uma implementação real, o frontend enviaria os IDs existentes para atualizar 
    # ou novos dados para criar. Aqui simplificaremos criando as unidades vinculadas.
    
    saved_units = []
    for m in markers:
        # Lógica simplificada: se a unidade com esse número já existe na quadra, atualiza x/y
        existing = db.query(models.Unit).filter(
            models.Unit.development_id == development_id,
            models.Unit.block_id == m.block_id,
            models.Unit.number == m.number
        ).first()
        
        if existing:
            existing.map_x = m.map_x
            existing.map_y = m.map_y
            db_unit = existing
        else:
            db_unit = models.Unit(
                **m.dict(),
                tenant_id=current_user.tenant_id
            )
            db.add(db_unit)
        
        saved_units.append(db_unit)
    
    db.commit()
    return {"status": "success", "units_count": len(saved_units)}

@router.put("/units/{unit_id}/position")
async def update_unit_position(
    unit_id: int,
    x: float,
    y: float,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Atualiza a posição de uma bolinha (unidade) no mapa via drag-and-drop."""
    unit = db.query(models.Unit).filter(
        models.Unit.id == unit_id,
        models.Unit.tenant_id == current_user.tenant_id
    ).first()
    
    if not unit:
        raise HTTPException(status_code=404, detail="Unidade não encontrada.")
    
    unit.map_x = x
    unit.map_y = y
    db.commit()
    
    return {"status": "updated", "id": unit_id, "x": x, "y": y}
