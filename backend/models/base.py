from sqlalchemy import Column, Integer, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import pytz

Base = declarative_base()

class TenantMixin:
    """Mixin to add tenant_id to models that are isolated per tenant."""
    tenant_id = Column(Integer, index=True, nullable=False)

class TimestampMixin:
    """Mixin to add created_at and updated_at to models."""
    created_at = Column(DateTime, default=lambda: datetime.now(pytz.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(pytz.utc), onupdate=lambda: datetime.now(pytz.utc), nullable=False)
