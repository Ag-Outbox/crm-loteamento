from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin, TenantMixin

class Task(Base, TimestampMixin, TenantMixin):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=True)
    assigned_to_id = Column(Integer, ForeignKey("users.id"))
    
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    task_type = Column(String) # Ligação, E-mail, Visita, WhatsApp, Nota
    due_date = Column(DateTime, nullable=True)
    is_completed = Column(Boolean, default=False)

    # Relationships
    lead = relationship("Lead", back_populates="tasks")
    assigned_to = relationship("User", foreign_keys=[assigned_to_id])

class LeadHistory(Base, TimestampMixin, TenantMixin):
    __tablename__ = "lead_history"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    lead_id = Column(Integer, ForeignKey("leads.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Quem fez a ação
    
    event_type = Column(String, nullable=False) # Ex: stage_change, note_added, call_logged
    description = Column(Text, nullable=False)

    # Relationships
    lead = relationship("Lead", back_populates="history")
    user = relationship("User", foreign_keys=[user_id])
