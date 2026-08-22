"""
Parte 1 — Núcleo: modelo de datos + motor de redirect.

Endpoints de esta parte:
  GET  /q/{slug}          -> el endpoint que escanea el celular. Registra
                             el escaneo y redirige al destino ACTUAL.
  POST /qr                -> crea un QR nuevo (temporal: sin auth todavía,
                             usa un owner_id fijo de prueba; en la Parte 3
                             esto se protege con JWT y el owner sale del token)
  GET  /qr/{slug}/stats    -> devuelve el destino actual + total de escaneos

Nota: no hay generación de imagen PNG del QR todavía — eso es la Parte 2.
Aquí solo se valida que el modelo de datos y el redirect funcionen.
"""
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app import models, schemas, crud
from app.database import engine, get_db, Base

# Crea las tablas si no existen (en producción esto se reemplaza por migraciones con Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="QR Dinámico — API")

# --- Usuario de prueba temporal, hasta que exista auth real (Parte 3) ---
TEST_USER_ID = "test-user-000"


def ensure_test_user(db: Session):
    user = db.query(models.User).filter(models.User.id == TEST_USER_ID).first()
    if not user:
        user = models.User(id=TEST_USER_ID, email="prueba@local.dev", hashed_password="temporal")
        db.add(user)
        db.commit()
    return user


@app.on_event("startup")
def on_startup():
    db = next(get_db())
    ensure_test_user(db)


@app.post("/qr", response_model=schemas.QRCodeOut)
def create_qr(payload: schemas.QRCodeCreate, db: Session = Depends(get_db)):
    qr = crud.create_qr_code(
        db, owner_id=TEST_USER_ID, destination_url=payload.destination_url, label=payload.label
    )
    return schemas.QRCodeOut(
        id=qr.id, slug=qr.slug, destination_url=qr.destination_url,
        label=qr.label, created_at=qr.created_at, total_scans=0,
    )


@app.get("/q/{slug}")
def scan_redirect(slug: str, request: Request, db: Session = Depends(get_db)):
    """
    Este es EL endpoint del producto. Lo que el celular toca al escanear
    el QR impreso. El slug nunca cambia; el destino sí.
    """
    qr = db.query(models.QRCode).filter(models.QRCode.slug == slug).first()
    if not qr:
        raise HTTPException(status_code=404, detail="Código QR no encontrado")

    crud.register_scan(db, qr, user_agent=request.headers.get("user-agent"))

    # 302: redirect temporal — le dice a los navegadores "no memorices esto",
    # así que la próxima vez vuelve a pasar por aquí y respeta el destino actual.
    return RedirectResponse(url=qr.destination_url, status_code=302)


@app.patch("/qr/{slug}", response_model=schemas.QRCodeOut)
def update_destination(slug: str, payload: schemas.QRCodeUpdate, db: Session = Depends(get_db)):
    """Esto es lo que el cliente usa desde el panel para 'cambiar la carta'."""
    qr = db.query(models.QRCode).filter(models.QRCode.slug == slug).first()
    if not qr:
        raise HTTPException(status_code=404, detail="Código QR no encontrado")

    qr.destination_url = payload.destination_url
    db.commit()
    db.refresh(qr)

    return schemas.QRCodeOut(
        id=qr.id, slug=qr.slug, destination_url=qr.destination_url,
        label=qr.label, created_at=qr.created_at, total_scans=crud.count_scans(db, qr.id),
    )


@app.get("/qr/{slug}/stats", response_model=schemas.QRCodeOut)
def get_stats(slug: str, db: Session = Depends(get_db)):
    qr = db.query(models.QRCode).filter(models.QRCode.slug == slug).first()
    if not qr:
        raise HTTPException(status_code=404, detail="Código QR no encontrado")

    return schemas.QRCodeOut(
        id=qr.id, slug=qr.slug, destination_url=qr.destination_url,
        label=qr.label, created_at=qr.created_at, total_scans=crud.count_scans(db, qr.id),
    )
# Main
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )