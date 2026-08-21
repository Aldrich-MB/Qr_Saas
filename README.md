# QR Dinámico — Backend (Parte 1)

## Qué incluye esta parte
- Modelo de datos: `User`, `QRCode` (con `slug` fijo + `destination_url` editable), `Scan`
- Motor de redirect: `GET /q/{slug}` registra el escaneo y redirige al destino ACTUAL
- Endpoints temporales sin auth (la auth llega en la Parte 3):
  - `POST /qr` — crea un QR nuevo
  - `PATCH /qr/{slug}` — cambia el destino (esto es lo que hará el panel)
  - `GET /qr/{slug}/stats` — destino actual + total de escaneos

## Cómo correrlo

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Abre http://127.0.0.1:8000/docs para probar los endpoints desde el navegador
(FastAPI genera esa interfaz automáticamente).

## Flujo de prueba manual
1. `POST /qr` con `{"destination_url": "https://tu-carta.com", "label": "Mesa 1"}`
2. Copia el `slug` que te regresa
3. Visita `http://127.0.0.1:8000/q/{slug}` en el navegador — debe redirigirte
4. `GET /qr/{slug}/stats` — debe mostrar 1 escaneo
5. `PATCH /qr/{slug}` con un nuevo `destination_url`
6. Vuelve a visitar `http://127.0.0.1:8000/q/{slug}` — ahora va al nuevo destino,
   con el mismo slug (el "cartel" nunca cambió)

## Próximas partes
- Parte 2: generar la imagen PNG/SVG del QR a partir del slug
- Parte 3: auth real (JWT) — reemplaza el `TEST_USER_ID` fijo
- Parte 4: panel en React
- Parte 5: Stripe (límite de 1 QR gratis, suscripciones)
