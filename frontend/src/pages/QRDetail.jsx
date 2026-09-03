import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { qrApi } from "../api/client";

export default function QRDetail() {
  const { slug } = useParams();
  const [qr, setQr] = useState(null);
  const [destinationUrl, setDestinationUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function loadStats() {
    try {
      const res = await qrApi.stats(slug);
      setQr(res.data);
      setDestinationUrl(res.data.destination_url);
    } catch (err) {
      setError("No se pudo cargar este código.");
    }
  }

  useEffect(() => {
    loadStats();
  }, [slug]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await qrApi.updateDestination(slug, destinationUrl);
      setSaved(true);
      loadStats();
    } catch (err) {
      setError("No se pudo guardar el cambio.");
    } finally {
      setSaving(false);
    }
  }

  if (error) return <div className="qs-page"><p className="qs-error">{error}</p></div>;
  if (!qr) return <div className="qs-page"><p className="qs-subtitle">Cargando…</p></div>;

  return (
    <div className="qs-page">
      <Link to="/dashboard" className="qs-back-link">&larr; Volver</Link>

      <p className="qs-eyebrow">Folio {slug}</p>
      <h1>{qr.label || "QR sin etiqueta"}</h1>

      <div className="qs-qr-block">
        <img src={qrApi.imageUrl(slug)} alt={`Código QR ${slug}`} className="qs-qr-image" width={220} height={220} />
        <p style={{ marginTop: 10 }}>
          <a href={qrApi.imageUrl(slug)} download={`qr-${slug}.png`}>
            Descargar para imprimir
          </a>
        </p>
      </div>

      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div className="qs-stamp-count">
          <strong>{qr.total_scans}</strong>
          <span>escaneos<br />totales</span>
        </div>
      </div>

      <hr className="qs-tear" />

      <div className="qs-ticket qs-ticket--form">
        <h3>Cambiar destino</h3>
        <p className="qs-subtitle">La imagen del QR no cambia — el cartel impreso sigue sirviendo.</p>
        <form onSubmit={handleSave}>
          <div className="qs-field">
            <input
              type="url"
              className="qs-input"
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="qs-btn" disabled={saving}>
            {saving ? "Guardando…" : "Guardar nuevo destino"}
          </button>
          {saved && <span className="qs-success" style={{ marginLeft: 12 }}>Guardado ✓</span>}
        </form>
      </div>
    </div>
  );
}
