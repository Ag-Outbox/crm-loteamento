from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas.lead as schemas

router = APIRouter(prefix="/api/leads", tags=["Leads"])

from routers.auth import get_current_user

# Mock function to get current user tenant (simulate Authentication setup)
def get_current_tenant_id() -> int:
    return 1 # Hardcoded for now assuming mock seed

@router.get("/stages", response_model=List[schemas.PipelineStageResponse])
def get_stages(db: Session = Depends(get_db)):
    tenant_id = get_current_tenant_id()
    stages = db.query(models.PipelineStage).filter(models.PipelineStage.tenant_id == tenant_id).order_by(models.PipelineStage.order).all()
    return stages

@router.get("/", response_model=List[schemas.LeadResponse])
def get_leads(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    query = db.query(models.Lead).filter(models.Lead.tenant_id == current_user.tenant_id)
    
    # Se for corretor, vê apenas os seus próprios leads
    if current_user.role == models.UserRole.BROKER:
        query = query.filter(models.Lead.broker_id == current_user.id)
        
    return query.all()

@router.post("/", response_model=schemas.LeadResponse)
def create_lead(lead: schemas.LeadCreate, db: Session = Depends(get_db)):
    tenant_id = get_current_tenant_id()
    new_lead = models.Lead(**lead.dict(), tenant_id=tenant_id)
    db.add(new_lead)
    db.commit()
    db.refresh(new_lead)
    return new_lead

@router.put("/{lead_id}/move", response_model=schemas.LeadResponse)
def move_lead(lead_id: int, move_req: schemas.MoveLeadRequest, db: Session = Depends(get_db)):
    tenant_id = get_current_tenant_id()
    lead = db.query(models.Lead).filter(models.Lead.id == lead_id, models.Lead.tenant_id == tenant_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    lead.stage_id = move_req.stage_id
    db.commit()
    db.refresh(lead)
    return lead
