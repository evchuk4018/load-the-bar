import { toKg, Unit } from './units';

export interface Plate {
  id: string;
  u: Unit;
  v: number;
  kg: number;
  c: string;
  d: number;
  t: number;
  ink: string;
}

const P = (u: Unit, v: number, c: string, d: number, t: number, ink = '#fff'): Plate =>
  ({ id: u + v, u, v, kg: toKg(v, u), c, d, t, ink });

const PLATES: Plate[] = [
  // d: diameter relative to 450 mm, from calibrated powerlifting plates.
  P('kg',25,'#d8312a',1,30), P('kg',20,'#2463d6',1,26), P('kg',15,'#f0c419',.89,22,'#111'), P('kg',10,'#2e9e57',.72,18),
  P('kg',5,'#f2f2f2',.51,16,'#111'), P('kg',2.5,'#d8312a',.42,13), P('kg',2,'#2463d6',.4,12), P('kg',1.5,'#f0c419',.38,11,'#111'),
  P('kg',1.25,'#b9bec4',.36,10,'#111'), P('kg',1,'#2e9e57',.33,9), P('kg',.5,'#f2f2f2',.3,8,'#111'), P('kg',.25,'#b9bec4',.24,7,'#111'),
  P('lb',55,'#a8261f',1,32), P('lb',45,'#1d4fa8',1,28), P('lb',35,'#c9a114',.89,24,'#111'), P('lb',25,'#23804a',.72,20),
  P('lb',10,'#4a4e55',.51,14), P('lb',5,'#4a4e55',.42,11), P('lb',2.5,'#4a4e55',.36,9),
];

const DEFAULT_ON = ['kg25','kg20','kg15','kg10','kg5','kg2.5','kg1.25','kg0.5','lb45','lb35','lb25','lb10','lb5','lb2.5'];

export const platesFor = (u: Unit): Plate[] => PLATES.filter(p => p.u === u && DEFAULT_ON.includes(p.id));

export const barKg = (u: Unit): number => toKg(u === 'kg' ? 20 : 45, u);
