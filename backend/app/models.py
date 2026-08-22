"""
Modelo de datos: El núcleo del producto.

La idea central: el QR impreso codifica un `slug` fijo (ej. "AB3X9K").
Ese slug nunca cambia. Lo que SÍ cambia es el campo `destination_url`
del registro QRCode al que apunta ese slug. El cartel físico nunca
se toca; el registro en la base de datos sí.
"""
import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    plan = Column(String, default="free")  # free | basico | negocio
    created_at = Column(DateTime, default=datetime.utcnow)

    qr_codes = relationship("QRCode", back_populates="owner", cascade="all, delete-orphan")

class QRCode(Base):
    __tablename__ = "qr_codes"

    id = Column(String, primary_key=True, default=gen_uuid)

    # El slug es lo que va codificado dentro de la imagen del QR impreso.
    # Es fijo desde su creación — es la "llave" que nunca cambia.
    slug = Column(String, unique=True, index=True, nullable=False)

    # Este campo SÍ es editable por el cliente desde el panel.
    # Es lo que hace que el QR sea "dinámico".
    destination_url = Column(String, nullable=False)

    label = Column(String, nullable=True)  # ej. "Mesa 4" o "Carta principal"
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="qr_codes")
    scans = relationship("Scan", back_populates="qr_code", cascade="all, delete-orphan")


class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, autoincrement=True)
    qr_code_id = Column(String, ForeignKey("qr_codes.id"), nullable=False)
    scanned_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Datos opcionales, útiles después para analítica (hora pico, etc.)
    user_agent = Column(String, nullable=True)
    ip_hash = Column(String, nullable=True)  # hash, nunca la IP en crudo (privacidad)

    qr_code = relationship("QRCode", back_populates="scans")
