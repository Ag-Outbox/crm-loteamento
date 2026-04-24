from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin, TenantMixin
import uuid as uuid_pkg

class Stand(Base, TimestampMixin, TenantMixin):
    __tablename__ = "stands"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String, default=lambda: str(uuid_pkg.uuid4()), unique=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    development_id = Column(Integer, ForeignKey("developments.id"), nullable=True)
    
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=True)
    
    # Configurações visuais e de plugins salvas como JSON
    config = Column(JSON, nullable=False, default={})
    
    is_active = Column(Boolean, default=True)

    # Relationships
    development = relationship("Development")
