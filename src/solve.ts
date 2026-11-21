import { Plate } from './plates';

// Fewest plates whose total is closest to sideKg, preferring under over over.
export function solve(sideKg: number, avail: Plate[]): Plate[] {
  const U = 100, ps = avail.map(p => ({ p, w: Math.round(p.kg * U) }));
  if (!ps.length || sideKg <= 0) return [];
  const side = Math.round(sideKg * U), N = side + Math.max(...ps.map(x => x.w));
  const INF = 30000, dp = new Int16Array(N + 1).fill(INF), from = new Int8Array(N + 1).fill(-1);
  dp[0] = 0;
  for (let w = 1; w <= N; w++) for (let i = 0; i < ps.length; i++) {
    const r = w - ps[i].w;
    if (r >= 0 && dp[r] + 1 < dp[w]) { dp[w] = dp[r] + 1; from[w] = i; }
  }
  let best = 0, bk = [Infinity, 0, 0];
  for (let w = 0; w <= N; w++) {
    if (dp[w] >= INF) continue;
    const k = [Math.round(Math.abs(w - side) / 3), w > side + 2 ? 1 : 0, dp[w]];
    if (k[0] < bk[0] || (k[0] === bk[0] && (k[1] < bk[1] || (k[1] === bk[1] && k[2] < bk[2])))) { best = w; bk = k; }
  }
  const out: Plate[] = [];
  for (let w = best; w > 0; w -= ps[from[w]].w) out.push(ps[from[w]].p);
  return out.sort((a, b) => b.kg - a.kg || b.d - a.d);
}
