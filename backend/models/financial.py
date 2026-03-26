from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum, Boolean
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin, TenantMixin
import enum

class ReceivableStatus(str, enum.Enum):
    NOT_ISSUED = "nao_emitido"
    ISSUED = "emitido"
    PAID = "pago"
    OVERDUE = "vencido"

class AccountReceivable(Base, TimestampMixin, TenantMixin):
    __tablename__ = "accounts_receivable"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    proposal_id = Column(Integer, ForeignKey("proposals.id"), nullable=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False)
    
    description = Column(String, nullable=False)
    amount_original = Column(Float, nullable=False)
    amount_current = Column(Float, nullable=False)
    due_date = Column(DateTime, nullable=False)
    payment_date = Column(DateTime, nullable=True)
    amount_paid = Column(Float, nullable=True)
    
    status = Column(Enum(ReceivableStatus), default=ReceivableStatus.NOT_ISSUED)
    payment_method = Column(String, nullable=True) # Boleto, PIX, Cartao
    installment_type = Column(String, nullable=True) # Entrada, Mensal, etc.
    installment_number = Column(Integer, nullable=True)

class AccountPayable(Base, TimestampMixin, TenantMixin):
    __tablename__ = "accounts_payable"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    
    description = Column(String, nullable=False)
    category = Column(String, nullable=True)
    amount = Column(Float, nullable=False)
    due_date = Column(DateTime, nullable=False)
    payment_date = Column(DateTime, nullable=True)
    is_paid = Column(Boolean, default=False)
    provider = Column(String, nullable=True)
