# Qr_Saas — Resumen del proyecto

_Actualizado: 17 de noviembre de 2026_

## 1. La idea

**Problema.** Un QR gratis lleva la URL grabada dentro. Si un bar cambia la carta, el cartel impreso de las mesas deja de servir y hay que reimprimir.

**Solución.** Un generador de códigos QR **dinámicos**. El QR impreso apunta siempre a una URL fija del servicio (`/q/{slug}`), y el servicio redirige al destino actual. El cliente cambia el destino desde un panel, sin tocar el cartel, y además ve cuántas personas escanean.

**Modelo de negocio.** Suscripción mensual. El cliente entra con 1 QR gratis, ve que sí lo escanean y paga para cubrir más mesas o negocios.

**Referencia.** Un caso de estudio similar (video) factura ~14,734 USD/mes con 1,324 suscripciones de pago. Eso da un ticket medio de ~11 USD y una conversión free→paid de ~0.66%.

## 2. Cómo funciona (arquitectura)

- El QR impreso codifica siempre `BASE_URL/q/{slug}`. El `slug` nunca cambia.
- El registro `QRCode` en la base de datos tiene un campo `destination_url` editable.
- Al escanear, `GET /q/{slug}` registra el escaneo y responde un **redirect 302** al destino actual. Se usa 302 y no 301 para que el navegador no memorice el destino y cada escaneo se cuente.
- Cambiar la carta es solo actualizar `destination_url` desde el panel.

## 3. Stack

| Capa | Tecnología |
|---|---|
| Backend / API | FastAPI (Python) |
| Base de datos | SQLite en desarrollo, PostgreSQL en producción (vía `DATABASE_URL`) |
| ORM | SQLAlchemy |
| Generación de QR | `qrcode[pil]` |
| Auth | JWT (`python-jose`) + `passlib[bcrypt]` con `bcrypt==4.0.1` fijado |
| Frontend | React + Vite, `axios`, `react-router-dom` |
| Pagos (pendiente) | Stripe |

## 4. Estructura del repo

```
Qr_Saas/
├── .gitignore
├── README.md
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── crud.py
│   │   ├── auth/        (security.py, dependencies.py, routes.py)
│   │   ├── qr/          (generator.py)
│   │   └── billing/     (pendiente: Parte 5)
│   ├── requirements.txt
│   └── README.md
├── frontend/
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api/client.js
│       ├── styles/theme.css
│       └── pages/       (Login, Register, Dashboard, QRDetail)
└── docs/
```

## 5. Lo que ya está hecho

### Parte 1: Núcleo
- Modelos `User`, `QRCode` (slug fijo + destino editable) y `Scan`.
- Motor de redirect `GET /q/{slug}` con conteo de escaneos.

### Parte 2: Imagen del QR
- `GET /qr/{slug}/image` devuelve el PNG listo para imprimir.
- Se verificó decodificando la imagen: codifica la URL de redirect, no el destino del negocio.

### Parte 3: Auth
- `POST /auth/register` y `POST /auth/login` (JWT).
- Los endpoints de QR exigen token y verifican que el QR pertenezca al usuario (403 si no).
- `/q/{slug}` y `/qr/{slug}/image` siguen públicos, porque los usa el celular del cliente final.

### Parte 4: Panel en React
- Login, registro, dashboard (lista y creación de QR) y detalle (imagen descargable, contador de escaneos, edición del destino).
- Se agregó CORS al backend.
- Diseño propio con estética de ticket/recibo y sello de tinta: papel `#F2EFE6`, tinta `#21201C`, acento `#1C6E8C`, tipografías IBM Plex Sans e IBM Plex Mono.

### Endpoints actuales

| Método | Ruta | Auth | Qué hace |
|---|---|---|---|
| POST | `/auth/register` | No | Crear cuenta |
| POST | `/auth/login` | No | Obtener token |
| POST | `/qr` | Sí | Crear QR |
| GET | `/qr` | Sí | Listar mis QR |
| PATCH | `/qr/{slug}` | Sí | Cambiar destino |
| GET | `/qr/{slug}/stats` | Sí | Destino actual y total de escaneos |
| GET | `/qr/{slug}/image` | No | Imagen PNG |
| GET | `/q/{slug}` | No | Redirect (el que usa el celular) |

### Problemas resueltos en el camino
- Faltaba el bloque `if __name__ == "__main__"` en `main.py`.
- `No module named 'app'`: se resuelve corriendo siempre desde `backend/` con `python -m app.main`.
- Faltaban `__init__.py` en `app/`, `app/qr/` y `app/auth/`.
- Pantalla en blanco en el frontend por falta de `vite.config.js` con `@vitejs/plugin-react`.
- Error de bcrypt (`password cannot be longer than 72 bytes`): se fijó `bcrypt==4.0.1`.

## 6. Pendientes y próximos pasos

**Pendiente inmediato:** confirmar que el registro de cuentas ya funciona tras el fix de `bcrypt==4.0.1`.

Orden acordado para lo que falta:

### Parte 5: Suscripciones con Stripe
- Límite de **1 QR gratis**; bloqueo al crear el 2º sin plan activo.
- Checkout, portal de cliente y webhooks.
- Nuevos campos en `User` (cliente y suscripción de Stripe). Hay que borrar `qr_saas.db` en desarrollo, o pasar a Alembic antes de producción.
- Archivos nuevos: `app/billing/` (`stripe_client.py`, `routes.py`, `limits.py`), `.env.example`, y en el frontend `Billing.jsx`.
- Preparar en Stripe: cuenta en modo de prueba, clave `sk_test_...`, dos productos mensuales en MXN (Básico y Negocio) con sus `price_...`, y Stripe CLI para webhooks locales.

### Parte 6: Analítica de escaneos
- Gráfica de los últimos 7 y 30 días.
- Hora pico (se apoya en los timestamps que ya guarda `Scan`).

### Landing con planes (al final)
Página con los planes Básico y Negocio y el flujo registro → 1 QR gratis → upsell.

### Lanzamiento y adquisición
- Buscar en el foro de pequeños negocios de Reddit posts sobre "QR tracking" y ofrecer el QR gratis a dueños de bares.
- Lanzamiento en Product Hunt (assets, lista de contactos).
- Afiliados con 30% de comisión de por vida, para más adelante (acumula costo recurrente).
- SEO por tipo de código QR.

### Versión 3
Modo arte con ControlNet QR Monster. Cada intento fallido consume GPU, así que se cobraría por créditos de intento.

## 7. Pricing acordado (referencia ~11 USD de ARPU)

| Plan | Incluye | Precio |
|---|---|---|
| Gratis | 1 QR dinámico, tracking visible, cambios ilimitados | $0 |
| Básico | Hasta 8 QR, escaneos y cambios ilimitados | $149-179 MXN/mes |
| Negocio | QR ilimitados, analítica por mesa y horario | $299-349 MXN/mes |

Con una mezcla aproximada de 70% Básico, 25% Negocio y 5% planes más caros, el ARPU ronda los $180-200 MXN (~11 USD). Pendiente fijar precios finales (propuesta: $149 y $299).

## 8. Notas de seguridad antes de producción
- Definir `JWT_SECRET_KEY` por variable de entorno (largo y aleatorio); nunca subirlo a GitHub.
- Las claves de Stripe van en `.env`, que ya está en `.gitignore`.
- En producción, cambiar `allow_origins` de CORS al dominio real del frontend.
- Definir `BASE_URL` con el dominio real, porque es lo que queda impreso en los QR.
- Migrar de `create_all` a Alembic y de SQLite a PostgreSQL.

## 9. Cómo correrlo en local

**Backend** (terminal 1):
```bash
cd backend
venv\Scripts\activate        # Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python -m app.main
```
Documentación interactiva en http://127.0.0.1:8000/docs

**Frontend** (terminal 2):
```bash
cd frontend
npm install
npm run dev
```
Panel en http://localhost:5173

## 10. Decisiones tomadas

- Nombre de trabajo: **Qr_Saas** (el nombre de marca se decide al final).
- Monorepo en GitHub con `backend/` y `frontend/`.
- Backend en FastAPI (lenguaje que ya dominas) para reducir riesgo.
- Modo arte pospuesto a la v3.
- Pulir el diseño del panel antes de integrar pagos.
- La fecha original de lanzamiento (01-09-26) ya pasó; hay que fijar una nueva.
