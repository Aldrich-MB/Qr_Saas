import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

const api = axios.create({ baseURL: API_URL });

// Antes de cada request, si hay un token guardado, lo agrega al header.
// Así cada página no tiene que preocuparse por meter el header a mano.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("qr_saas_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el backend responde 401 (token vencido o inválido), regresa al login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("qr_saas_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (email, password) => api.post("/auth/register", { email, password }),

  login: (email, password) => {
    // El backend espera form-urlencoded (estándar OAuth2), no JSON.
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);
    return api.post("/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },
};

export const qrApi = {
  list: () => api.get("/qr"),
  create: (destination_url, label) => api.post("/qr", { destination_url, label }),
  updateDestination: (slug, destination_url) => api.patch(`/qr/${slug}`, { destination_url }),
  stats: (slug) => api.get(`/qr/${slug}/stats`),
  imageUrl: (slug) => `${API_URL}/qr/${slug}/image`,
};

export default api;
