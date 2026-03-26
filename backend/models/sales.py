from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum, Boolean
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin, TenantMixin
from datetime import datetime
import enum

class ProposalStatus(str, enum.Enum):
    PENDING = "aguardando"
    APPROVED = "aprovada"
    ADJUSTMENT = "pendencia"
    REJECTED = "reprovada"
    CANCELLED = "cancelada"

class Reservation(Base, TimestampMixin, TenantMixin):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    lead_id = Column(Integer, ForeignKey("leads.id"))
    unit_id = Column(Integer, ForeignKey("units.id"))
    broker_id = Column(Integer, ForeignKey("users.id"))
    
    expires_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)

    # Relationships
    unit = relationship("Unit", back_populates="reservations")

class Proposal(Base, TimestampMixin, TenantMixin):
    __tablename__ = "proposals"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    lead_id = Column(Integer, ForeignKey("leads.id"))
    unit_id = Column(Integer, ForeignKey("units.id"))
    broker_id = Column(Integer, ForeignKey("users.id"))
    
    total_amount = Column(Float, nullable=False)
    status = Column(Enum(ProposalStatus), default=ProposalStatus.PENDING)
    notes = Column(String, nullable=True)

    # Relationships
    installments = relationship("ProposalInstallment", back_populates="proposal", cascade="all, delete-orphan")

class ProposalInstallment(Base, TimestampMixin, TenantMixin):
    __tablename__ = "proposal_installments"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    proposal_id = Column(Integer, ForeignKey("proposals.id"))
    
    type = Column(String, nullable=False) # Entrada, Mensal, Intermediária, etc.
    amount = Column(Float, nullable=False)
    due_date = Column(DateTime, nullable=False)
    installment_number = Column(Integer, nullable=False)

    # Relationships
    proposal = relationship("Proposal", back_populates="installments")
