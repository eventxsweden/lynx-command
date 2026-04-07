// Server-side KV store — Upstash Redis in production, in-memory for dev
import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
    return redis;
  }
  return null;
}

// In-memory fallback for local development
const memStore = new Map<string, string>();

export async function kvSet(key: string, value: unknown): Promise<void> {
  const r = getRedis();
  const json = JSON.stringify(value);
  if (r) {
    await r.set(key, json, { ex: 86400 }); // 24h expiry
  } else {
    memStore.set(key, json);
  }
}

export async function kvGet<T = unknown>(key: string): Promise<T | null> {
  const r = getRedis();
  if (r) {
    const val = await r.get<string>(key);
    if (val === null || val === undefined) return null;
    if (typeof val === "string") {
      try { return JSON.parse(val) as T; } catch { return val as unknown as T; }
    }
    return val as unknown as T;
  }
  const val = memStore.get(key);
  return val ? (JSON.parse(val) as T) : null;
}

export async function kvDel(key: string): Promise<void> {
  const r = getRedis();
  if (r) {
    await r.del(key);
  } else {
    memStore.delete(key);
  }
}

export async function kvKeys(pattern: string): Promise<string[]> {
  const r = getRedis();
  if (r) {
    const keys: string[] = [];
    let cursor = 0;
    do {
      const result = await r.scan(cursor, { match: pattern, count: 100 });
      cursor = Number(result[0]);
      keys.push(...(result[1] as string[]));
    } while (cursor !== 0);
    return keys;
  }
  const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
  return Array.from(memStore.keys()).filter((k) => regex.test(k));
}
