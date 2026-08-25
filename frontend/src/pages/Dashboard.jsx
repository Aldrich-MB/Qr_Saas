import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { qrApi } from "../api/client";

export default function Dashboard() {
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Formulario de creación
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
      loadQrCodes(); // refresca la lista con el nuevo QR incluido
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
    <div style={{ maxWidth: 700, margin: "40px auto", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Mis códigos QR</h1>
        <button onClick={handleLogout}>Cerrar sesión</button>
      </div>

      <form onSubmit={handleCreate} style={{ margin: "20px 0", padding: 16, border: "1px solid #ddd" }}>
        <h3>Crear nuevo QR</h3>
        <input
          type="url"
          placeholder="https://tu-carta.com"
          value={destinationUrl}
          onChange={(e) => setDestinationUrl(e.target.value)}
          required
          style={{ width: "60%", padding: 8, marginRight: 8 }}
        />
        <input
          type="text"
          placeholder="Etiqueta (ej. Mesa 1)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          style={{ width: "25%", padding: 8, marginRight: 8 }}
        />
        <button type="submit" disabled={creating}>
          {creating ? "Creando..." : "Crear"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : qrCodes.length === 0 ? (
        <p>Todavía no tienes ningún código QR. Crea el primero arriba.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
              <th style={{ padding: 8 }}>Etiqueta</th>
              <th style={{ padding: 8 }}>Destino actual</th>
              <th style={{ padding: 8 }}>Escaneos</th>
              <th style={{ padding: 8 }}></th>
            </tr>
          </thead>
          <tbody>
            {qrCodes.map((qr) => (
              <tr key={qr.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 8 }}>{qr.label || "(sin etiqueta)"}</td>
                <td style={{ padding: 8, maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {qr.destination_url}
                </td>
                <td style={{ padding: 8 }}>{qr.total_scans}</td>
                <td style={{ padding: 8 }}>
                  <Link to={`/qr/${qr.slug}`}>Ver / editar</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
