// frontend/src/pages/LandingPage.jsx
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* ===== HERO SECTION ===== */}
      <header className="hero">
        <div className="hero-content">
          <p className="qs-eyebrow">Qr_Saas</p>
          <h1>
            Códigos QR que <br />
            <span className="highlight">siempre puedes cambiar</span>
          </h1>
          <p className="hero-subtitle">
            Actualiza el destino de tus QR en segundos. Sin reimprimir.
            Ideal para restaurantes, menús y promociones.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="qs-btn qs-btn--primary">
              Comenzar ahora
            </Link>
            <Link to="/login" className="qs-btn qs-btn--ghost">
              Ya tengo cuenta
            </Link>
          </div>
          <p className="hero-footnote">🎯 Sin tarjeta de crédito. Comienza gratis.</p>
        </div>
        <div className="hero-image">
          <div className="hero-qr-preview">
            <div className="qr-simbolo">📱</div>
            <div className="qr-texto">QR Dinámico</div>
            <div className="qr-detalle">Siempre actualizable</div>
          </div>
        </div>
      </header>

      {/* ===== FEATURES ===== */}
      <section className="features">
        <h2>Todo lo que necesitas en un solo lugar</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3>Actualiza en tiempo real</h3>
            <p>Cambia el destino de cualquier QR sin volver a imprimir. El cartel físico siempre sirve.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Estadísticas claras</h3>
            <p>Sabes cuántas personas escanearon cada código. Datos actualizados al instante.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🖨️</div>
            <h3>Descarga e imprime</h3>
            <p>Obtén la imagen PNG de tus QR en alta calidad. Lista para pegar en tu local.</p>
          </div>
        </div>
      </section>

      {/* ===== SOCIAL PROOF ===== */}
      <section className="social-proof">
        <p>
          🧾 <strong>+1,200</strong> negocios ya confían en Qr_Saas
        </p>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="landing-footer">
        <p>© 2026 Qr_Saas · Hecho con ☕ y papel de libreta.</p>
      </footer>
    </div>
  );
}