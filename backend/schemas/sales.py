from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from models.sales import ProposalStatus, PaymentType

class ProposalInstallmentBase(BaseModel):
    payment_type: PaymentType
    count: int = 1
    amount_per_installment: float
    total_group_amount: float
    start_date: Optional[datetime] = None
    index_type: Optional[str] = None
    interest_rate: Optional[float] = 0.0

class ProposalInstallmentResponse(ProposalInstallmentBase):
    id: int
    proposal_id: int
    class Config:
        from_attributes = True

class ProposalBase(BaseModel):
    lead_id: int
    unit_id: int
    total_amount: float
    valid_until: Optional[datetime] = None
    notes: Optional[str] = None

class ProposalCreate(ProposalBase):
    installments: List[ProposalInstallmentBase]

class ProposalResponse(ProposalBase):
    id: int
    tenant_id: int
    broker_id: Optional[int] = None
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
