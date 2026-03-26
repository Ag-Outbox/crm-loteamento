from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from models.financial import ReceivableStatus

class AccountReceivableBase(BaseModel):
    description: str
    amount_original: float
    due_date: datetime
    payment_method: Optional[str] = None
    installment_type: Optional[str] = None
    installment_number: Optional[int] = None
    lead_id: int

class AccountReceivableResponse(AccountReceivableBase):
    id: int
    tenant_id: int
    proposal_id: Optional[int] = None
    amount_current: float
    payment_date: Optional[datetime] = None
    amount_paid: Optional[float] = None
    status: ReceivableStatus
    class Config:
        from_attributes = True

class AccountPayableBase(BaseModel):
    description: str
    category: Optional[str] = None
    amount: float
    due_date: datetime
    provider: Optional[str] = None

class AccountPayableResponse(AccountPayableBase):
    id: int
    tenant_id: int
    payment_date: Optional[datetime] = None
    is_paid: bool
    class Config:
        from_attributes = True
