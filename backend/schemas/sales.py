from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from models.sales import ProposalStatus

class ProposalInstallmentBase(BaseModel):
    type: str # Entrada, Mensal, etc.
    amount: float
    due_date: datetime
    installment_number: int

class ProposalInstallmentResponse(ProposalInstallmentBase):
    id: int
    proposal_id: int
    class Config:
        from_attributes = True

class ProposalBase(BaseModel):
    lead_id: int
    unit_id: int
    total_amount: float
    notes: Optional[str] = None

class ProposalCreate(ProposalBase):
    installments: List[ProposalInstallmentBase]

class ProposalResponse(ProposalBase):
    id: int
    tenant_id: int
    broker_id: int
    status: ProposalStatus
    installments: List[ProposalInstallmentResponse]
    class Config:
        from_attributes = True

class ReservationCreate(BaseModel):
    lead_id: int
    unit_id: int
    expires_at: datetime

class ReservationResponse(BaseModel):
    id: int
    tenant_id: int
    lead_id: int
    unit_id: int
    broker_id: int
    expires_at: datetime
    is_active: bool
    class Config:
        from_attributes = True
