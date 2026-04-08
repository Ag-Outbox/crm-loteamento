from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from .units import UnitResponse

class PipelineStageBase(BaseModel):
    name: str
    order: int
    color: Optional[str] = "#E5E7EB"

class PipelineStageResponse(PipelineStageBase):
    id: int
    tenant_id: int
    class Config:
        from_attributes = True

class LeadBase(BaseModel):
    full_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    product_interest: Optional[str] = None
    origin: Optional[str] = None
    temperature: Optional[str] = "morno"
    score: Optional[int] = 0

class LeadCreate(LeadBase):
    stage_id: int
    unit_interests: Optional[List[int]] = []

class LeadUpdate(BaseModel):
    stage_id: Optional[int] = None
    full_name: Optional[str] = None
    temperature: Optional[str] = None
    score: Optional[int] = None
    broker_id: Optional[int] = None
    unit_interests: Optional[List[int]] = None

class LeadResponse(LeadBase):
    id: int
    tenant_id: int
    stage_id: int
    broker_id: Optional[int] = None
    unit_interests: Optional[List[UnitResponse]] = []
    class Config:
        from_attributes = True

class MoveLeadRequest(BaseModel):
    stage_id: int
