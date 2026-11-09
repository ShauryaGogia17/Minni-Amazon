import { useMemo, useSyncExternalStore } from "react";

const KEY = "shopai.recently-viewed.v1";
const EVENT = "shopai:browsing-change";
type Visit = { id: string; at: number };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function read() {
  try { return localStorage.getItem(KEY) || "[]"; } catch { return "[]"; }
}
function visits(raw: string): Visit[] {
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter((v): v is Visit => v && typeof v.id === "string" && uuid.test(v.id)
      && typeof v.at === "number" && v.at > Date.now() - 30 * 86400000).slice(0, 20);
  } catch { return []; }
}
function write(value: Visit[]) {
  try { localStorage.setItem(KEY, JSON.stringify(value)); } catch { /* Browsing remains available with storage blocked. */ }
  window.dispatchEvent(new Event(EVENT));
}
export function recordProductView(id: string) {
  if (!uuid.test(id)) return;
  write([{ id, at: Date.now() }, ...visits(read()).filter(v => v.id !== id)].slice(0, 20));
}
export function clearBrowsingHistory() { write([]); }
function subscribe(notify: () => void) {
  window.addEventListener(EVENT, notify);
  window.addEventListener("storage", notify);
  return () => {
    window.removeEventListener(EVENT, notify);
    window.removeEventListener("storage", notify);
  };
}
export function useBrowsingHistory() {
  const raw = useSyncExternalStore(subscribe, read, () => "[]");
  return useMemo(() => visits(raw).map(v => v.id), [raw]);
}
