export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: 'include',
    headers: { 'content-type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || `Request gagal (${response.status})`);
  return data as T;
}

export const authApi = {
  me: () => api<{ authenticated: boolean; user?: { id: string; email: string; nama: string; foto: string | null } }>('/api/auth/me'),
  login: () => { window.location.href = '/api/auth/login'; },
  logout: () => { window.location.href = '/api/auth/logout'; },
};
