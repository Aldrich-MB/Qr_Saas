# QR Dinámico — Backend (Partes 1-4 completas)

## Qué incluye el proyecto hasta ahora

**Parte 1 — Núcleo**
- Modelo de datos: `User`, `QRCode` (con `slug` fijo + `destination_url` editable), `Scan`
- Motor de redirect: `GET /q/{slug}` registra el escaneo y redirige al destino ACTUAL

**Parte 2 — Imagen del QR**
- `GET /qr/{slug}/image` — genera y devuelve el PNG del código, listo para imprimir
- La imagen codifica siempre la URL de redirect fija (`BASE_URL + /q/ + slug`), nunca el `destination_url` — por eso el cartel impreso no cambia aunque el negocio cambie de carta

**Parte 3 — Auth (JWT)**
- `POST /auth/register` — crea una cuenta
- `POST /auth/login` — devuelve un token de acceso
- Todos los endpoints de QR (crear, editar, ver stats) ahora requieren el token y verifican que el QR pertenezca al usuario logueado (403 si no)
- `GET /q/{slug}` (el redirect) y `GET /qr/{slug}/image` siguen siendo públicos, sin auth — son los que usa el celular del cliente del negocio

**Parte 4 — Panel en React**
- Login, registro, dashboard (lista + creación de QR) y detalle (editar destino, ver imagen, ver escaneos)
- Vive en `frontend/`, corre por separado del backend (ver su propio README)

## Endpoints actuales

| Método | Ruta | Auth | Qué hace |
|---|---|---|---|
| POST | `/auth/register` | No | Crear cuenta |
| POST | `/auth/login` | No | Obtener token |
| POST | `/qr` | Sí | Crear un QR nuevo |
| GET | `/qr` | Sí | Listar mis QR |
| PATCH | `/qr/{slug}` | Sí | Cambiar el destino |
| GET | `/qr/{slug}/stats` | Sí | Ver destino actual + total de escaneos |
| GET | `/qr/{slug}/image` | No | Descargar la imagen PNG |
| GET | `/q/{slug}` | No | El redirect real (lo usa el celular al escanear) |

## Cómo correrlo

```bash
cd backend
python -m venv venv
venv\Scripts\activate      # Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python -m app.main
```

Abre http://127.0.0.1:8000/docs para probar los endpoints desde el navegador
(FastAPI genera esa interfaz automáticamente). Usa el botón "Authorize" ahí
arriba para meter tu correo/contraseña después de registrarte, y así probar
los endpoints protegidos.

Para el panel completo, corre también el frontend (ver `frontend/README.md`)
en una segunda terminal — necesitas los dos corriendo a la vez.

## Flujo de prueba manual (API directa, sin el panel)
1. `POST /auth/register` con `{"email": "...", "password": "..."}`
2. `POST /auth/login` (form-data: `username`, `password`) → copia el `access_token`
3. En "Authorize" (`/docs`) pega tus credenciales, o manda el header
   `Authorization: Bearer {token}` a mano
4. `POST /qr` con `{"destination_url": "https://tu-carta.com", "label": "Mesa 1"}`
5. `GET /qr/{slug}/image` — descarga la imagen del QR
6. Visita `http://127.0.0.1:8000/q/{slug}` en el navegador — debe redirigirte
   y sumar 1 al contador
7. `PATCH /qr/{slug}` con un nuevo `destination_url`
8. Vuelve a visitar `http://127.0.0.1:8000/q/{slug}` — ahora va al nuevo
   destino, con el mismo slug (el "cartel" nunca cambió)

## Nota de seguridad antes de producción
`SECRET_KEY` en `app/auth/security.py` tiene un valor temporal de desarrollo.
Antes de lanzar, define la variable de entorno `JWT_SECRET_KEY` con un valor
largo y aleatorio — nunca subas el real a GitHub.

## Próximas partes
- Parte 5: Stripe (límite de 1 QR gratis, bloqueo al crear el 2º sin plan, suscripciones)
- Parte 6: Analítica de escaneos (gráfica de últimos 7/30 días, hora pico)
- v3 (futuro): modo arte con ControlNet QR Monster
