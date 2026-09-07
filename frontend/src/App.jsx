// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import QRDetail from "./pages/QRDetail";
import LandingPage from "./pages/LandingPage"; 

function RequireAuth({ children }) {
  const token = localStorage.getItem("qr_saas_token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTA PRINCIPAL: Landing Page */}
        <Route path="/" element={<LandingPage />} />  {/* ← CAMBIADO */}

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/qr/:slug"
          element={
            <RequireAuth>
              <QRDetail />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;