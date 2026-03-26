from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas.sales as schemas

router = APIRouter(prefix="/api/sales", tags=["Sales"])

# Mock function to get current user tenant
def get_current_tenant_id() -> int:
    return 1

# Mock function to get current user id
def get_current_user_id() -> int:
    return 1 # Admin/Broker de teste

@router.post("/reservations", response_model=schemas.ReservationResponse)
def create_reservation(res: schemas.ReservationCreate, db: Session = Depends(get_db)):
    tenant_id = get_current_tenant_id()
    broker_id = get_current_user_id()
    
    # Check if unit is available
    unit = db.query(models.Unit).filter(models.Unit.id == res.unit_id, models.Unit.tenant_id == tenant_id).first()
    if not unit or unit.status != models.UnitStatus.AVAILABLE:
        raise HTTPException(status_code=400, detail="Unit is not available for reservation")
    
    new_res = models.Reservation(
        **res.dict(),
        tenant_id=tenant_id,
        broker_id=broker_id
    )
    
    # Update unit status
    unit.status = models.UnitStatus.RESERVED
    
    db.add(new_res)
    db.commit()
    db.refresh(new_res)
    return new_res

@router.post("/proposals", response_model=schemas.ProposalResponse)
def create_proposal(prop: schemas.ProposalCreate, db: Session = Depends(get_db)):
    tenant_id = get_current_tenant_id()
    broker_id = get_current_user_id()
    
    # In a real scenario, we would validate if the unit matches the lead interest, etc.
    
    new_prop = models.Proposal(
        lead_id=prop.lead_id,
        unit_id=prop.unit_id,
        total_amount=prop.total_amount,
        notes=prop.notes,
        tenant_id=tenant_id,
        broker_id=broker_id,
        status=models.ProposalStatus.PENDING
    )
    db.add(new_prop)
    db.commit()
    db.refresh(new_prop)
    
    # Add installments
    for inst in prop.installments:
        new_inst = models.ProposalInstallment(
            **inst.dict(),
            proposal_id=new_prop.id,
            tenant_id=tenant_id
        )
        db.add(new_inst)
    
    db.commit()
    db.refresh(new_prop)
    return new_prop
