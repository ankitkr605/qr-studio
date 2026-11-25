const API_BASE = import.meta.env.VITE_API_URL || '/api';
export const REDIRECT_BASE_URL =
  import.meta.env.VITE_REDIRECT_BASE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');

const TOKEN_KEY = 'qr_studio_token';

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      (typeof data === 'object' && data?.message) ||
      (typeof data === 'object' && data?.error) ||
      'Request failed. Please try again.';
    const error = new Error(message);
    error.status = response.status;
    error.details = data?.errors || null;
    throw error;
  }

  return data;
}

export const authApi = {
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => request('/auth/me'),
  updateProfile: (payload) => request('/auth/profile', { method: 'PATCH', body: JSON.stringify(payload) }),
  changePassword: (payload) => request('/auth/password', { method: 'PATCH', body: JSON.stringify(payload) }),
};

export const qrApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
    });
    const query = qs.toString();
    return request(`/qrcodes${query ? `?${query}` : ''}`);
  },
  getOne: (id) => request(`/qrcodes/${id}`),
  create: (payload) => request('/qrcodes', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => request(`/qrcodes/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  remove: (id) => request(`/qrcodes/${id}`, { method: 'DELETE' }),
};

export const analyticsApi = {
  overview: (days = 30) => request(`/analytics/overview?days=${days}`),
  byQrId: (id, days = 30) => request(`/analytics/qrcodes/${id}?days=${days}`),
};
