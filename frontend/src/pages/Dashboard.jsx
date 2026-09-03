import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { qrApi } from "../api/client";

export default function Dashboard() {
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [destinationUrl, setDestinationUrl] = useState("");
  const [label, setLabel] = useState("");
  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();

  async function loadQrCodes() {
    setLoading(true);
    try {
      const res = await qrApi.list();
      setQrCodes(res.data);
    } catch (err) {
      setError("No se pudieron cargar tus códigos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQrCodes();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      await qrApi.create(destinationUrl, label);
      setDestinationUrl("");
      setLabel("");
      loadQrCodes();
    } catch (err) {
      setError("No se pudo crear el código.");
    } finally {
      setCreating(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("qr_saas_token");
    navigate("/login");
  }

  return (
    <div className="qs-page qs-page--wide">
      <div className="qs-topbar">
        <div>
          <p className="qs-eyebrow">Qr_Saas</p>
          <h1>Mis códigos</h1>
        </div>
        <button className="qs-btn qs-btn--ghost" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>

      <div className="qs-ticket qs-ticket--form">
        <h3>Crear nuevo QR</h3>
        <form onSubmit={handleCreate} className="qs-form-row">
          <div className="qs-field">
            <label htmlFor="dest">Destino</label>
            <input
              id="dest"
              type="url"
              className="qs-input"
              placeholder="https://tu-carta.com"
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
              required
            />
          </div>
          <div className="qs-field">
            <label htmlFor="label">Etiqueta</label>
            <input
              id="label"
              type="text"
              className="qs-input"
              placeholder="Mesa 1"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>
          <button type="submit" className="qs-btn" disabled={creating}>
            {creating ? "Creando…" : "Crear"}
          </button>
        </form>
      </div>

      {error && <p className="qs-error">{error}</p>}

      {loading ? (
        <p className="qs-subtitle">Cargando…</p>
      ) : qrCodes.length === 0 ? (
        <div className="qs-empty">Todavía no tienes ningún código. Crea el primero arriba.</div>
      ) : (
        <div className="qs-ticket">
          {qrCodes.map((qr) => (
            <div className="qs-list-item" key={qr.id}>
              <div>
                <div className="qs-list-label">{qr.label || "(sin etiqueta)"}</div>
                <span className="qs-list-url">{qr.destination_url}</span>
              </div>
              <div className="qs-list-count">{qr.total_scans} escaneos</div>
              <Link to={`/qr/${qr.slug}`}>Ver / editar</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
