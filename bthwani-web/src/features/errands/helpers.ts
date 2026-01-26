// src/features/errands/helpers.ts
import type { PointLocation } from "./types";

const pad = (n: number) => String(n).padStart(2, "0");

export function fmtTime(h: number, m: number) {
  const ampm = h < 12 ? "ص" : "م";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${pad(m)} ${ampm}`;
}

export function toLocalIso(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

export function dayTitle(offset: number, d: Date) {
  const wd = [
    "الأحد",
    "الاثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ][d.getDay()];
  if (offset === 0) return `اليوم (${wd})`;
  if (offset === 1) return `غدًا (${wd})`;
  return `${wd} ${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function buildSlots(dayOffset: number) {
  const now = new Date();
  const base = new Date(now);
  base.setHours(8, 0, 0, 0);
  base.setDate(base.getDate() + dayOffset);
  if (dayOffset === 0) {
    const t = new Date(now);
    t.setMinutes(t.getMinutes() + 45, 0, 0);
    const rem = t.getMinutes() % 30;
    if (rem !== 0) t.setMinutes(t.getMinutes() + (30 - rem));
    if (t > base) base.setHours(t.getHours(), t.getMinutes(), 0, 0);
  }
  const end = new Date(base);
  end.setHours(22, 0, 0, 0);
  const slots: { label: string; isoLocal: string; hour: number; min: number }[] = [];
  const cur = new Date(base);
  while (cur <= end) {
    slots.push({
      label: fmtTime(cur.getHours(), cur.getMinutes()),
      isoLocal: toLocalIso(cur),
      hour: cur.getHours(),
      min: cur.getMinutes(),
    });
    cur.setMinutes(cur.getMinutes() + 30);
  }
  return slots;
}

export function haversineKm(a: PointLocation, b: PointLocation): number | null {
  if (a.lat == null || a.lng == null || b.lat == null || b.lng == null) return null;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad((b.lat as number) - (a.lat as number));
  const dLng = toRad((b.lng as number) - (a.lng as number));
  const lat1 = toRad(a.lat as number), lat2 = toRad(b.lat as number);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}