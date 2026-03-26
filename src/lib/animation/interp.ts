/**
 * Interpolation helper for scroll-driven animations.
 * Maps a progress value within [start, end] range to [from, to] output range.
 */
export function interp(progress: number, start: number, end: number, from: number, to: number): number {
  const t = Math.max(0, Math.min(1, (progress - start) / (end - start)));
  return from + (to - from) * t;
}
