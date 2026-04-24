from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class StandBase(BaseModel):
    name: str
    development_id: Optional[int] = None
    slug: Optional[str] = None
    config: Dict[str, Any]
    is_active: bool = True

class StandCreate(StandBase):
    pass

class StandUpdate(BaseModel):
    name: Optional[str] = None
    development_id: Optional[int] = None
    slug: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class StandResponse(StandBase):
    id: int
    uuid: str
    tenant_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
