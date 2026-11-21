// Strength scores for men. All weights in kg.

// Epley estimate of a one-rep max.
export const e1rm = (w: number, reps: number): number => (reps > 1 ? w * (1 + reps / 30) : w);

// DOTS (IPF 2020 coefficients, highest power first).
const DOTS = [-0.000001093, 0.0007391293, -0.1918759221, 24.0900756, -307.75076];
export function dots(total: number, bw: number): number {
  const x = Math.min(Math.max(bw, 40), 210);
  return (total * 500) / DOTS.reduce((a, c) => a * x + c, 0);
}

// IPF GoodLift points (GLP), classic three-lift total.
export const glp = (total: number, bw: number): number =>
  (total * 100) / (1199.72839 - 1025.18162 * Math.exp(-0.00921 * bw));

// Share of the total each lift may take when a total is split across them.
const RANGE = [[0.3, 0.42], [0.18, 0.3], [0.34, 0.46]];
const DEFAULT = [0.36, 0.24, 0.4];

// Splits a total across squat, bench and deadlift, keeping their current balance within RANGE.
export function split(total: number, maxes: number[]): number[] {
  const sum = maxes.reduce((a, b) => a + b, 0);
  const share = maxes.map((m, i) => Math.min(Math.max(maxes.every(x => x > 0) ? m / sum : DEFAULT[i], RANGE[i][0]), RANGE[i][1]));
  const n = share.reduce((a, b) => a + b, 0);
  return share.map(s => (total * s) / n);
}
