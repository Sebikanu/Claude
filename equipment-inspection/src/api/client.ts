import type { Equipment, Inspection } from '../types';

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Equipment ────────────────────────────────────────────────────────────────
export const api = {
  equipment: {
    list: () =>
      request<Equipment[]>('/equipment'),

    create: (data: Omit<Equipment, 'id' | 'createdAt'>) =>
      request<Equipment>('/equipment', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: Partial<Equipment>) =>
      request<Equipment>(`/equipment/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      request<{ success: boolean }>(`/equipment/${id}`, { method: 'DELETE' }),
  },

  inspections: {
    list: () =>
      request<Inspection[]>('/inspections'),

    create: (data: Omit<Inspection, 'id'>) =>
      request<Inspection>('/inspections', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      request<{ success: boolean }>(`/inspections/${id}`, { method: 'DELETE' }),
  },

  health: () =>
    request<{ status: string; equipment: number; timestamp: string }>('/health'),
};
