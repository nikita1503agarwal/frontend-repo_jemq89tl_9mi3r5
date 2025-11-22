const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

export async function apiFetch(path, { method = 'GET', body, headers = {} } = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let msg = `Error ${res.status}`;
    try {
      const data = await res.json();
      msg = data.detail || data.message || msg;
    } catch {}
    throw new Error(msg);
  }
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export const AuthAPI = {
  async login(email, password) {
    return apiFetch('/api/auth/login', { method: 'POST', body: { email, password } });
  },
  async register(payload) {
    return apiFetch('/api/auth/register', { method: 'POST', body: payload });
  },
  me() {
    return apiFetch('/api/users/me');
  },
};

export const StoresAPI = {
  list(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/api/stores${qs ? `?${qs}` : ''}`);
  },
  get(id) {
    return apiFetch(`/api/stores/${id}`);
  },
  create(payload) {
    return apiFetch('/api/stores', { method: 'POST', body: payload });
  },
  update(id, payload) {
    return apiFetch(`/api/stores/${id}`, { method: 'PATCH', body: payload });
  },
  remove(id) {
    return apiFetch(`/api/stores/${id}`, { method: 'DELETE' });
  },
  reviews(id, params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/api/stores/${id}/reviews${qs ? `?${qs}` : ''}`);
  },
  addReview(id, payload) {
    return apiFetch(`/api/stores/${id}/reviews`, { method: 'POST', body: payload });
  },
};

export const AdminAPI = {
  users() { return apiFetch('/api/users'); },
  setRole(id, role) { return apiFetch(`/api/users/${id}/role`, { method: 'PATCH', body: { role } }); },
};
