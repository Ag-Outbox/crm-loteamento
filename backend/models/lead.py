from sqlalchemy import Column, Integer, String, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin, TenantMixin
import enum

class LeadTemperature(str, enum.Enum):
    COLD = "frio"
    WARM = "morno"
    HOT = "quente"

class PipelineStage(Base, TimestampMixin, TenantMixin):
    __tablename__ = "pipeline_stages"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    name = Column(String, nullable=False) # Ex: Oportunidades, Em Atendimento, Reserva, etc.
    order = Column(Integer, default=0) # Posicionamento no Kanban
    color = Column(String, default="#E5E7EB")

    # Relationships
    leads = relationship("Lead", back_populates="stage")

class Lead(Base, TimestampMixin, TenantMixin):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    broker_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Corretor atual
    stage_id = Column(Integer, ForeignKey("pipeline_stages.id"))
    
    # Lead profile
    full_name = Column(String, index=True, nullable=False)
    phone = Column(String, index=True, nullable=True)
    email = Column(String, index=True, nullable=True)
    product_interest = Column(String, nullable=True) # Empreendimento
    origin = Column(String, nullable=True) # Ex: Site, WhatsApp, Ads
    temperature = Column(Enum(LeadTemperature), default=LeadTemperature.WARM)
    score = Column(Integer, default=0)

    # Relationships
    tenant = relationship("Tenant", back_populates="leads")
    broker = relationship("User", back_populates="leads_managed", foreign_keys=[broker_id])
    stage = relationship("PipelineStage", back_populates="leads")
    tasks = relationship("Task", back_populates="lead", cascade="all, delete-orphan")
    history = relationship("LeadHistory", back_populates="lead", cascade="all, delete-orphan")
