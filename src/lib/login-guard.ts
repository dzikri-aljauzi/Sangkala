// Guard brute-force login: rate-limit in-memory per email + per IP.
// Tanpa dependensi baru, tanpa migrasi DB. Map hilang saat restart,
// acceptable untuk VPS single-instance SQLite saat ini.
const WINDOW_MS = 10 * 60 * 1000; // 10 menit
const LOCK_MS = 15 * 60 * 1000; // lock 15 menit
const MAX_FAIL_EMAIL = 5;
const MAX_FAIL_IP = 20;

interface Entry {
  count: number;
  firstAt: number;
  lockedUntil: number;
}

const byEmail = new Map<string, Entry>();
const byIp = new Map<string, Entry>();

function getEntry(map: Map<string, Entry>, key: string): Entry {
  const now = Date.now();
  let e = map.get(key);
  if (!e || now - e.firstAt > WINDOW_MS) {
    e = { count: 0, firstAt: now, lockedUntil: 0 };
    map.set(key, e);
  }
  // ponytail: sweep sederhana, full LRU bila ukuran jadi masalah
  if (map.size > 2000) {
    for (const [k, v] of map) {
      if (now - v.firstAt > WINDOW_MS && v.lockedUntil < now) map.delete(k);
      if (map.size <= 1000) break;
    }
  }
  return e;
}

export function getClientIp(headers: Headers | Record<string, string | string[] | undefined>): string {
  const h = (name: string): string | undefined => {
    if (typeof (headers as Headers).get === "function") {
      return (headers as Headers).get(name) ?? undefined;
    }
    const v = (headers as Record<string, string | string[] | undefined>)[name];
    return Array.isArray(v) ? v[0] : v;
  };
  const fwd = h("x-forwarded-for") ?? h("X-Forwarded-For");
  if (fwd) return fwd.split(",")[0].trim();
  return h("x-real-ip") ?? h("X-Real-Ip") ?? "unknown";
}

export function checkLoginLimit(email: string, ip: string): { blocked: boolean; retryMinutes: number } {
  const now = Date.now();
  const emailKey = email.toLowerCase().trim();
  const e1 = getEntry(byEmail, emailKey);
  if (e1.lockedUntil > now) {
    return { blocked: true, retryMinutes: Math.ceil((e1.lockedUntil - now) / 60000) };
  }
  if (ip !== "unknown") {
    const e2 = getEntry(byIp, ip);
    if (e2.lockedUntil > now) {
      return { blocked: true, retryMinutes: Math.ceil((e2.lockedUntil - now) / 60000) };
    }
  }
  return { blocked: false, retryMinutes: 0 };
}

export function recordLoginFail(email: string, ip: string): void {
  const now = Date.now();
  const e1 = getEntry(byEmail, email.toLowerCase().trim());
  e1.count += 1;
  if (e1.count >= MAX_FAIL_EMAIL) e1.lockedUntil = now + LOCK_MS;
  if (ip !== "unknown") {
    const e2 = getEntry(byIp, ip);
    e2.count += 1;
    if (e2.count >= MAX_FAIL_IP) e2.lockedUntil = now + LOCK_MS;
  }
}

export function resetLoginGuard(email: string): void {
  byEmail.delete(email.toLowerCase().trim());
}

export function lockMessage(retryMinutes: number): string {
  return `Terlalu banyak percobaan login. Coba lagi dalam ${retryMinutes} menit.`;
}
