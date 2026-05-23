export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

export function radToDeg(rad) {
  return (rad * 180) / Math.PI;
}

export function vecLength(x, y, z = 0) {
  return Math.sqrt(x * x + y * y + z * z);
}

export function formatNum(n, digits = 2) {
  if (n == null || Number.isNaN(n)) return '—';
  return Number(n).toFixed(digits);
}
