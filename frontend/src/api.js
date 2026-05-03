import { session } from './session';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// ── Core fetch with automatic token injection ─────────────────────────────────
async function api(method, path, body, useToken = true) {
  const headers = { 'Content-Type': 'application/json' };

  if (useToken) {
    const token = session.getActiveToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, opts);

  // Handle token expiry — clear session and reload
  if (res.status === 401) {
    const data = await res.json().catch(() => ({}));
    if (data.expired) {
      session.clearAll();
      window.location.href = '/accio';
      return;
    }
    throw new Error('Authentication required');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// ── Public endpoints (no token needed) ───────────────────────────────────────
export const validateCode   = (code)  => api('POST', '/api/validate-code', { code }, false);
export const setupParent    = (body)  => api('POST', '/api/parent/setup', body, false);
export const loginParent    = (body)  => api('POST', '/api/parent/login', body, false);
export const loginChild     = (body)  => api('POST', '/api/child/login', body, false);

// ── Protected parent endpoints ────────────────────────────────────────────────
export const getChildren       = (parentId)      => api('GET', `/api/parent/${parentId}/children`);
export const createChild       = (body)          => api('POST', '/api/child/create', body);
export const updatePreferences = (childId, body) => api('PUT', `/api/child/${childId}/preferences`, body);
export const recordConsent     = (body)          => api('POST', '/api/parent/record-consent', body);
export const deleteChildData   = (childId, body) => api('DELETE', `/api/child/${childId}/delete`, body);

// ── Protected child endpoints ─────────────────────────────────────────────────
export const saveAboutMe    = (body)    => api('POST', '/api/child/about-me', body);
export const getChildProfile = (childId) => api('GET', `/api/child/${childId}/profile`);

// ── AI endpoints ──────────────────────────────────────────────────────────────
export const getAccioResponse = (body) => api('POST', '/api/about-me/response', body);
