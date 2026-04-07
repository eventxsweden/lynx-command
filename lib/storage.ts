// Client-side storage helpers — calls /api/kv
const BASE = "/api/kv";

export async function sSet(key: string, val: unknown): Promise<void> {
  try {
    await fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: val }),
    });
  } catch (e) {
    console.error("sSet error:", e);
  }
}

export async function sGet<T = unknown>(key: string, fallback: T | null = null): Promise<T> {
  try {
    const res = await fetch(`${BASE}?key=${encodeURIComponent(key)}`);
    if (!res.ok) return fallback as T;
    const data = await res.json();
    return data.value !== null && data.value !== undefined ? data.value : (fallback as T);
  } catch {
    return fallback as T;
  }
}

export async function sDel(key: string): Promise<void> {
  try {
    await fetch(BASE, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
  } catch (e) {
    console.error("sDel error:", e);
  }
}

export async function sKeys(pattern: string): Promise<string[]> {
  try {
    const res = await fetch(`${BASE}?keys=${encodeURIComponent(pattern)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.keys || [];
  } catch {
    return [];
  }
}
