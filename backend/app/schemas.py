"""
Schemas Pydantic para validación de datos de entrada/salida.
"""
from datetime import datetime
from pydantic import BaseModel


class QRCodeCreate(BaseModel):
    destination_url: str
    label: str | None = None


class QRCodeUpdate(BaseModel):
    destination_url: str


class QRCodeOut(BaseModel):
    id: str
    slug: str
    destination_url: str
    label: str | None
    created_at: datetime
    total_scans: int = 0

    class Config:
        from_attributes = True


class ScanOut(BaseModel):
    scanned_at: datetime

    class Config:
        from_attributes = True