// Strength scores for men. All weights in kg.
export type Lift = 's' | 'b' | 'd' | 't';

// Epley estimate of a one-rep max.
export const e1rm = (w: number, reps: number): number => (reps > 1 ? w * (1 + reps / 30) : w);

// DOTS (IPF 2020 coefficients, highest power first).
const DOTS = [-0.000001093, 0.0007391293, -0.1918759221, 24.0900756, -307.75076];
export function dots(w: number, bw: number): number {
  const x = Math.min(Math.max(bw, 40), 210);
  return (w * 500) / DOTS.reduce((a, c) => a * x + c, 0);
}

// IPF GoodLift points (GLP), classic. Defined only for total and bench.
const GLP = { t: [1199.72839, 1025.18162, 0.00921], b: [320.98041, 281.40258, 0.01008] };
export function glp(w: number, bw: number, lift: Lift): number | null {
  if (lift !== 't' && lift !== 'b') return null;
  const [a, b, c] = GLP[lift];
  return (w * 100) / (a - b * Math.exp(-c * bw));
}
