from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean, Enum, DateTime
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin, TenantMixin
import enum

class UnitStatus(str, enum.Enum):
    SOLD = "vendido"
    AVAILABLE = "disponivel"
    RESERVED = "reservado"
    PRE_RESERVE = "pre_reserva"
    PERMANENT_RESERVE = "res_permanente"
    BLOCKED = "bloqueado"
    UNAVAILABLE = "indisponivel"

class Development(Base, TimestampMixin, TenantMixin):
    __tablename__ = "developments"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    location = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    map_image_url = Column(String, nullable=True) # Para o mapa interativo

    # Relationships
    blocks = relationship("Block", back_populates="development", cascade="all, delete-orphan")
    units = relationship("Unit", back_populates="development", cascade="all, delete-orphan")

class Block(Base, TimestampMixin, TenantMixin):
    __tablename__ = "blocks"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    development_id = Column(Integer, ForeignKey("developments.id"))
    name = Column(String, nullable=False) # Ex: Torre A, Quadra 01

    # Relationships
    development = relationship("Development", back_populates="blocks")
    units = relationship("Unit", back_populates="block", cascade="all, delete-orphan")

class Unit(Base, TimestampMixin, TenantMixin):
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    development_id = Column(Integer, ForeignKey("developments.id"))
    block_id = Column(Integer, ForeignKey("blocks.id"))
    
    number = Column(String, nullable=False) # Ex: Ap 101, Lote 05
    floor = Column(Integer, nullable=True)
    area_m2 = Column(Float, nullable=True)
    price = Column(Float, nullable=False)
    status = Column(Enum(UnitStatus), default=UnitStatus.AVAILABLE, nullable=False)
    
    # Coordenadas para o mapa interativo
    map_x = Column(Float, nullable=True)
    map_y = Column(Float, nullable=True)

    # Relationships
    development = relationship("Development", back_populates="units")
    block = relationship("Block", back_populates="units")
    reservations = relationship("Reservation", back_populates="unit")
