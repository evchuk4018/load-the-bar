export type Unit = 'kg' | 'lb';

export const LB = 0.45359237;

export const fmt = (n: number): string => String(+n.toFixed(2));

export const toU = (kg: number, u: Unit): number => (u === 'kg' ? kg : kg / LB);

export const toKg = (v: number, u: Unit): number => (u === 'kg' ? v : v * LB);

export const step = (u: Unit): number => (u === 'kg' ? 2.5 : 5);
