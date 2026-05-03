const BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

async function api(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const validateCode         = (code)         => api('POST', '/api/validate-code', { code });
export const setupParent          = (body)          => api('POST', '/api/parent/setup', body);
export const loginParent          = (body)          => api('POST', '/api/parent/login', body);
export const getChildren          = (parentId)      => api('GET', `/api/parent/${parentId}/children`);
export const createChild          = (body)          => api('POST', '/api/child/create', body);
export const loginChild           = (body)          => api('POST', '/api/child/login', body);
export const saveAboutMe          = (body)          => api('POST', '/api/child/about-me', body);
export const getChildProfile      = (childId)       => api('GET', `/api/child/${childId}/profile`);
export const updatePreferences    = (childId, body) => api('PUT', `/api/child/${childId}/preferences`, body);
