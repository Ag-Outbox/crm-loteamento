from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from models.units import UnitStatus

class DevelopmentBase(BaseModel):
    name: str
    description: Optional[str] = None
    location: Optional[str] = None
    logo_url: Optional[str] = None
    map_image_url: Optional[str] = None

class DevelopmentCreate(DevelopmentBase):
    pass

class DevelopmentResponse(DevelopmentBase):
    id: int
    tenant_id: int
    class Config:
        from_attributes = True

class BlockBase(BaseModel):
    name: str
    development_id: int

class BlockCreate(BlockBase):
    pass

class BlockResponse(BlockBase):
    id: int
    tenant_id: int
    class Config:
        from_attributes = True

class UnitBase(BaseModel):
    number: str
    block_id: int
    development_id: int
    floor: Optional[int] = None
    area_m2: Optional[float] = None
    price: float
    status: UnitStatus = UnitStatus.AVAILABLE
    map_x: Optional[float] = None
    map_y: Optional[float] = None

class UnitCreate(UnitBase):
    pass

class UnitUpdate(BaseModel):
    status: Optional[UnitStatus] = None
    price: Optional[float] = None
    number: Optional[str] = None

class UnitResponse(UnitBase):
    id: int
    tenant_id: int
    class Config:
        from_attributes = True
