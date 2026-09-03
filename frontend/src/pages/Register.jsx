import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/client";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.register(email, password);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "No se pudo registrar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="qs-page--center">
      <div className="qs-ticket qs-ticket--auth">
        <p className="qs-eyebrow">Qr_Saas</p>
        <h1>Crear cuenta</h1>
        <p className="qs-subtitle">Tu primer código QR va incluido, sin costo.</p>

        <form onSubmit={handleSubmit}>
          <div className="qs-field">
            <label htmlFor="email">Correo</label>
            <input
              id="email"
              type="email"
              className="qs-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="qs-field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              className="qs-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          {error && <p className="qs-error">{error}</p>}
          <button type="submit" className="qs-btn qs-btn--full" disabled={loading}>
            {loading ? "Creando…" : "Crear cuenta"}
          </button>
        </form>

        <p className="qs-footnote">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
