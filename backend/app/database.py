"""
Configuración de la base de datos.

Para desarrollo local usa SQLite automáticamente (cero configuración).
Para producción, define la variable de entorno DATABASE_URL apuntando
a tu Postgres (ej. el que te da Railway/Render), y se usa esa sin
cambiar una línea de código.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./qr_saas.db")

# connect_args solo es necesario para SQLite (permite multi-hilo)
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency de FastAPI: abre una sesión de DB por request y la cierra al terminar."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
