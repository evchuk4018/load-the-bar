// Strength scores. All weights in kg.
export type Sex = 'm' | 'f';
export type Lift = 's' | 'b' | 'd' | 't';

// Epley estimate of a one-rep max.
export const e1rm = (w: number, reps: number): number => (reps > 1 ? w * (1 + reps / 30) : w);

// DOTS (IPF 2020 coefficients, highest power first).
const DOTS = {
  m: [-0.000001093, 0.0007391293, -0.1918759221, 24.0900756, -307.75076],
  f: [-0.0000010706, 0.0005158568, -0.1126655495, 13.6175032, -57.96288],
};
export function dots(w: number, bw: number, sex: Sex): number {
  const x = Math.min(Math.max(bw, 40), sex === 'm' ? 210 : 150);
  return (w * 500) / DOTS[sex].reduce((a, c) => a * x + c, 0);
}

// IPF GoodLift points (GLP), classic. Defined only for total and bench.
const GLP = {
  t: { m: [1199.72839, 1025.18162, 0.00921], f: [610.32796, 1045.59282, 0.03048] },
  b: { m: [320.98041, 281.40258, 0.01008], f: [142.40398, 442.52671, 0.04724] },
};
export function glp(w: number, bw: number, sex: Sex, lift: Lift): number | null {
  if (lift !== 't' && lift !== 'b') return null;
  const [a, b, c] = GLP[lift][sex];
  return (w * 100) / (a - b * Math.exp(-c * bw));
}
