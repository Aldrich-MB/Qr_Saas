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
from fastapi.responses import RedirectResponse, Response
from sqlalchemy.orm import Session

from app import models, schemas, crud
from app.database import engine, get_db, Base
from app.qr.generator import generate_qr_image
from app.auth.routes import router as auth_router
from app.auth.dependencies import get_current_user

# Crea las tablas si no existen (en producción esto se reemplaza por migraciones con Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="QR Dinámico — API")
app.include_router(auth_router)


@app.post("/qr", response_model=schemas.QRCodeOut)
def create_qr(
    payload: schemas.QRCodeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    qr = crud.create_qr_code(
        db, owner_id=current_user.id, destination_url=payload.destination_url, label=payload.label
    )
    return schemas.QRCodeOut(
        id=qr.id, slug=qr.slug, destination_url=qr.destination_url,
        label=qr.label, created_at=qr.created_at, total_scans=0,
    )


@app.get("/qr", response_model=list[schemas.QRCodeOut])
def list_my_qr_codes(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Lista todos los QR del usuario logueado — lo que alimenta el dashboard del panel."""
    qr_codes = db.query(models.QRCode).filter(models.QRCode.owner_id == current_user.id).all()
    return [
        schemas.QRCodeOut(
            id=qr.id, slug=qr.slug, destination_url=qr.destination_url,
            label=qr.label, created_at=qr.created_at, total_scans=crud.count_scans(db, qr.id),
        )
        for qr in qr_codes
    ]


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
def update_destination(
    slug: str,
    payload: schemas.QRCodeUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Esto es lo que el cliente usa desde el panel para 'cambiar la carta'."""
    qr = db.query(models.QRCode).filter(models.QRCode.slug == slug).first()
    if not qr:
        raise HTTPException(status_code=404, detail="Código QR no encontrado")
    if qr.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Este QR no te pertenece")

    qr.destination_url = payload.destination_url
    db.commit()
    db.refresh(qr)

    return schemas.QRCodeOut(
        id=qr.id, slug=qr.slug, destination_url=qr.destination_url,
        label=qr.label, created_at=qr.created_at, total_scans=crud.count_scans(db, qr.id),
    )


@app.get("/qr/{slug}/stats", response_model=schemas.QRCodeOut)
def get_stats(
    slug: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    qr = db.query(models.QRCode).filter(models.QRCode.slug == slug).first()
    if not qr:
        raise HTTPException(status_code=404, detail="Código QR no encontrado")
    if qr.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Este QR no te pertenece")

    return schemas.QRCodeOut(
        id=qr.id, slug=qr.slug, destination_url=qr.destination_url,
        label=qr.label, created_at=qr.created_at, total_scans=crud.count_scans(db, qr.id),
    )


@app.get("/qr/{slug}/image")
def get_qr_image(slug: str, db: Session = Depends(get_db)):
    """
    Devuelve la imagen PNG del QR, lista para descargar e imprimir.
    Ojo: la imagen codifica la URL de redirect fija (BASE_URL + slug),
    NUNCA el destination_url actual — así el cartel impreso no cambia
    aunque el cliente edite el destino desde el panel.
    """
    qr = db.query(models.QRCode).filter(models.QRCode.slug == slug).first()
    if not qr:
        raise HTTPException(status_code=404, detail="Código QR no encontrado")

    image_bytes = generate_qr_image(qr.slug)
    return Response(content=image_bytes, media_type="image/png")


# Permite arrancar el servidor con: python app/main.py
# (alternativa a usar el comando "uvicorn app.main:app --reload" en la terminal)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
