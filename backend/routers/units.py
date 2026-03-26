from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas.units as schemas

router = APIRouter(prefix="/api/units", tags=["Units"])

# Mock function to get current user tenant
def get_current_tenant_id() -> int:
    return 1

@router.get("/developments", response_model=List[schemas.DevelopmentResponse])
def get_developments(db: Session = Depends(get_db)):
    tenant_id = get_current_tenant_id()
    return db.query(models.Development).filter(models.Development.tenant_id == tenant_id).all()

@router.get("/developments/{dev_id}/blocks", response_model=List[schemas.BlockResponse])
def get_blocks(dev_id: int, db: Session = Depends(get_db)):
    tenant_id = get_current_tenant_id()
    return db.query(models.Block).filter(models.Block.development_id == dev_id, models.Block.tenant_id == tenant_id).all()

@router.get("/developments/{dev_id}/mirror", response_model=List[schemas.UnitResponse])
def get_unit_mirror(dev_id: int, db: Session = Depends(get_db)):
    tenant_id = get_current_tenant_id()
    return db.query(models.Unit).filter(models.Unit.development_id == dev_id, models.Unit.tenant_id == tenant_id).all()

@router.get("/{unit_id}", response_model=schemas.UnitResponse)
def get_unit(unit_id: int, db: Session = Depends(get_db)):
    tenant_id = get_current_tenant_id()
    unit = db.query(models.Unit).filter(models.Unit.id == unit_id, models.Unit.tenant_id == tenant_id).first()
    if not unit:
          raise HTTPException(status_code=404, detail="Unit not found")
    return unit

@router.put("/{unit_id}/status", response_model=schemas.UnitResponse)
def update_unit_status(unit_id: int, unit_update: schemas.UnitUpdate, db: Session = Depends(get_db)):
    tenant_id = get_current_tenant_id()
    unit = db.query(models.Unit).filter(models.Unit.id == unit_id, models.Unit.tenant_id == tenant_id).first()
    if not unit:
          raise HTTPException(status_code=404, detail="Unit not found")
    
    if unit_update.status:
        unit.status = unit_update.status
    
    db.commit()
    db.refresh(unit)
    return unit
