"""
Parte 2 — Generación de la imagen del QR.

Punto clave: la imagen SIEMPRE codifica la URL de redirect fija
(BASE_URL + slug), nunca el destination_url. Por eso el cartel
impreso nunca necesita cambiar aunque el negocio cambie de carta.
"""
import io
import os

import qrcode
from qrcode.constants import ERROR_CORRECT_M

# En producción, esto debe ser tu dominio real, ej. "https://qrsaas.com"
# Se lee de una variable de entorno para no tener que tocar código al
# pasar de desarrollo local a producción.
BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000")


def build_redirect_url(slug: str) -> str:
    return f"{BASE_URL}/q/{slug}"


def generate_qr_image(slug: str) -> bytes:
    """
    Genera la imagen PNG del QR que codifica la URL de redirect fija.
    Devuelve los bytes del PNG, listos para servir o guardar.
    """
    redirect_url = build_redirect_url(slug)

    qr = qrcode.QRCode(
        version=None,  # None = ajusta automáticamente el tamaño según el contenido
        error_correction=ERROR_CORRECT_M,  # nivel medio: tolera algo de daño/superposición
        box_size=10,
        border=4,  # margen blanco alrededor, requerido para que lectores lo detecten bien
    )
    qr.add_data(redirect_url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return buffer.getvalue()
