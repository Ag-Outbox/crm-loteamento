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
    EXPIRED = "expirada"

class PaymentType(str, enum.Enum):
    DOWN_PAYMENT = "entrada"
    MONTHLY = "mensal"
    INTERMEDIATE = "reforco"
    FINAL = "balao"
    FINANCING = "financiamento"

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
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False)
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=False)
    broker_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    total_amount = Column(Float, nullable=False)
    status = Column(Enum(ProposalStatus), default=ProposalStatus.PENDING)
    valid_until = Column(DateTime, nullable=True)
    notes = Column(String, nullable=True)

    # Relationships
    lead = relationship("Lead")
    unit = relationship("Unit")
    installments = relationship("ProposalInstallment", back_populates="proposal", cascade="all, delete-orphan")

class ProposalInstallment(Base, TimestampMixin, TenantMixin):
    __tablename__ = "proposal_installments"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    proposal_id = Column(Integer, ForeignKey("proposals.id"), nullable=False)
    
    payment_type = Column(Enum(PaymentType), nullable=False)
    count = Column(Integer, default=1) # Numero de parcelas deste grupo
    amount_per_installment = Column(Float, nullable=False)
    total_group_amount = Column(Float, nullable=False)
    
    start_date = Column(DateTime, nullable=True)
    index_type = Column(String, nullable=True) # Ex: INCC, IGPM
    interest_rate = Column(Float, default=0.0)

    # Relationships
    proposal = relationship("Proposal", back_populates="installments")
