export type Job = "walls" | "ceilings" | "facade";
export type Paint = "standard" | "premium" | "eco";

export interface QuoteInput {
  job: Job;
  area: number; // m²
  coats: 1 | 2 | 3;
  paint: Paint;
  prep: boolean; // sanding and filling
  rush: boolean; // start within 7 days
}

const HOURLY = 650; // NOK per painter hour
const HOURS_PER_M2 = { walls: 0.11, ceilings: 0.15, facade: 0.18 };
const LITRE_PRICE = { standard: 189, premium: 289, eco: 249 };
const COVERAGE = 9; // m² per litre per coat
const CREW_HOURS_PER_DAY = 15; // two painters

export function quote(input: QuoteInput) {
  const { job, area, coats, paint, prep, rush } = input;
  const paintHours = area * coats * HOURS_PER_M2[job];
  const prepHours = prep ? area * 0.06 : 0;
  const hours = Math.max(4, paintHours + prepHours + 1.5);

  const labour = hours * HOURLY;
  const litres = Math.ceil((area * coats) / COVERAGE);
  const materials = litres * LITRE_PRICE[paint];
  const surcharge = rush ? labour * 0.15 : 0;

  const net = labour + materials + surcharge;
  const vat = net * 0.25;
  return {
    hours, litres, labour, materials, surcharge,
    net, vat, total: net + vat,
    days: Math.ceil(hours / CREW_HOURS_PER_DAY),
  };
}
