import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/client";

export default function Login() {
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
      const res = await authApi.login(email, password);
      localStorage.setItem("qr_saas_token", res.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "No se pudo iniciar sesión. Revisa tus datos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="qs-page--center">
      <div className="qs-ticket qs-ticket--auth">
        <p className="qs-eyebrow">Qr_Saas</p>
        <h1>Iniciar sesión</h1>
        <p className="qs-subtitle">Entra para ver tus códigos y sus escaneos.</p>

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
            />
          </div>
          {error && <p className="qs-error">{error}</p>}
          <button type="submit" className="qs-btn qs-btn--full" disabled={loading}>
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className="qs-footnote">
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}
