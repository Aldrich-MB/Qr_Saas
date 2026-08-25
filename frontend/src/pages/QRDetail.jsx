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
      loadStats(); // refresca para confirmar el cambio guardado
    } catch (err) {
      setError("No se pudo guardar el cambio.");
    } finally {
      setSaving(false);
    }
  }

  if (error) return <p style={{ color: "red", textAlign: "center", marginTop: 40 }}>{error}</p>;
  if (!qr) return <p style={{ textAlign: "center", marginTop: 40 }}>Cargando...</p>;

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", fontFamily: "sans-serif" }}>
      <Link to="/dashboard">&larr; Volver</Link>
      <h1>{qr.label || "QR sin etiqueta"}</h1>

      <div style={{ textAlign: "center", margin: "20px 0" }}>
        <img
          src={qrApi.imageUrl(slug)}
          alt={`Código QR ${slug}`}
          style={{ border: "1px solid #ddd", padding: 10 }}
        />
        <p>
          <a href={qrApi.imageUrl(slug)} download={`qr-${slug}.png`}>
            Descargar imagen para imprimir
          </a>
        </p>
      </div>

      <div style={{ padding: 16, background: "#f5f5f5", marginBottom: 20 }}>
        <strong>Escaneos totales: {qr.total_scans}</strong>
      </div>

      <form onSubmit={handleSave}>
        <label>Cambiar destino (la imagen del QR no cambia)</label>
        <input
          type="url"
          value={destinationUrl}
          onChange={(e) => setDestinationUrl(e.target.value)}
          required
          style={{ width: "100%", padding: 8, margin: "8px 0" }}
        />
        <button type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Guardar nuevo destino"}
        </button>
        {saved && <span style={{ color: "green", marginLeft: 10 }}>Guardado ✓</span>}
      </form>
    </div>
  );
}
