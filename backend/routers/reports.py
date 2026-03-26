from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any

from database import get_db
import models

router = APIRouter(prefix="/api/reports", tags=["Reports"])

def get_current_tenant_id() -> int:
    return 1

@router.get("/leads-by-origin")
def get_leads_by_origin(db: Session = Depends(get_db)):
    tenant_id = get_current_tenant_id()
    results = db.query(
        models.Lead.origin, 
        func.count(models.Lead.id)
    ).filter(models.Lead.tenant_id == tenant_id).group_by(models.Lead.origin).all()
    
    return [{"origin": r[0] or "Não Informado", "count": r[1]} for r in results]

@router.get("/sales-performance")
def get_sales_performance(db: Session = Depends(get_db)):
    tenant_id = get_current_tenant_id()
    # Performance por corretor
    results = db.query(
        models.User.full_name,
        func.count(models.Proposal.id)
    ).join(models.Proposal, models.User.id == models.Proposal.broker_id)\
     .filter(models.User.tenant_id == tenant_id)\
     .group_by(models.User.full_name).all()
    
    return [{"broker": r[0], "proposals": r[1]} for r in results]

@router.get("/financial-summary")
def get_financial_summary(db: Session = Depends(get_db)):
    tenant_id = get_current_tenant_id()
    
    overdue = db.query(func.sum(models.AccountReceivable.amount_current))\
                .filter(models.AccountReceivable.tenant_id == tenant_id, models.AccountReceivable.status == models.ReceivableStatus.OVERDUE).scalar() or 0
                
    pending = db.query(func.sum(models.AccountReceivable.amount_current))\
                .filter(models.AccountReceivable.tenant_id == tenant_id, models.AccountReceivable.status == models.ReceivableStatus.ISSUED).scalar() or 0
                
    paid = db.query(func.sum(models.AccountReceivable.amount_paid))\
             .filter(models.AccountReceivable.tenant_id == tenant_id, models.AccountReceivable.status == models.ReceivableStatus.PAID).scalar() or 0
    
    return {
        "overdue": overdue,
        "pending": pending,
        "paid": paid
    }
