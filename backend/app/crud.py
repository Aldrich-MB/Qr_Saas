"""
Operaciones CRUD para la base de datos.
"""
import secrets
import string
from sqlalchemy.orm import Session
from app import models

ALPHABET = string.ascii_uppercase + string.digits


def generate_slug(length: int = 6) -> str:
    return "".join(secrets.choice(ALPHABET) for _ in range(length))


def generate_unique_slug(db: Session, length: int = 6, max_attempts: int = 10) -> str:
    """Genera un slug y verifica que no exista ya en la DB."""
    for _ in range(max_attempts):
        slug = generate_slug(length)
        exists = db.query(models.QRCode).filter(models.QRCode.slug == slug).first()
        if not exists:
            return slug
    raise RuntimeError("No se pudo generar un slug único, intenta de nuevo")


def create_qr_code(db: Session, owner_id: str, destination_url: str, label: str | None = None) -> models.QRCode:
    slug = generate_unique_slug(db)
    qr = models.QRCode(slug=slug, destination_url=destination_url, label=label, owner_id=owner_id)
    db.add(qr)
    db.commit()
    db.refresh(qr)
    return qr


def register_scan(db: Session, qr_code: models.QRCode, user_agent: str | None = None) -> models.Scan:
    scan = models.Scan(qr_code_id=qr_code.id, user_agent=user_agent)
    db.add(scan)
    db.commit()
    return scan


def count_scans(db: Session, qr_code_id: str) -> int:
    return db.query(models.Scan).filter(models.Scan.qr_code_id == qr_code_id).count()