export const API_URL = ((globalThis as any).process?.env?.NEXT_PUBLIC_API_URL) || 'http://localhost:5000/api';

async function handleRes(res: Response) {
  const text = await res.text();
  try {
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw new Error(data?.message || res.statusText || 'API error');
    return data;
  } catch (e) {
    if (!res.ok) throw new Error(res.statusText || 'API error');
    return text;
  }
}

export async function apiGet<T = any>(path: string, qs?: Record<string, any>): Promise<T> {
  const url = new URL(`${API_URL}${path}`, 'http://localhost');
  if (qs) Object.keys(qs).forEach(k => url.searchParams.append(k, String(qs[k])));
  const res = await fetch(`${API_URL}${path}${qs ? '?' + new URLSearchParams(qs as any).toString() : ''}`, { cache: 'no-store' });
  return handleRes(res);
}

export async function apiPost<T = any>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return handleRes(res);
}

export async function apiPut<T = any>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return handleRes(res);
}

export async function apiDelete<T = any>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { method: 'DELETE' });
  return handleRes(res);
}
