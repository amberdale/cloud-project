/** Mølle Bakeri: the sample client brand assembled in the Branding demo. */
export const MOLLE = {
  rye: '#2B1F17',
  crust: '#A9542F',
  oat: '#E3D3B3',
  flour: '#F5F0E6',
  fjord: '#4F6670',
};

export const PALETTE = [
  { name: 'Flour', hex: MOLLE.flour, cmyk: '3 4 9 0', ink: MOLLE.rye, share: 30 },
  { name: 'Oat', hex: MOLLE.oat, cmyk: '10 15 32 0', ink: MOLLE.rye, share: 21 },
  { name: 'Crust', hex: MOLLE.crust, cmyk: '20 72 90 12', ink: MOLLE.flour, share: 19 },
  { name: 'Rye', hex: MOLLE.rye, cmyk: '50 65 75 70', ink: MOLLE.flour, share: 17 },
  { name: 'Fjord', hex: MOLLE.fjord, cmyk: '70 45 40 20', ink: MOLLE.flour, share: 13 },
];

/** Layered contact shadow for paper objects lying on a surface. */
export const PAPER_SHADOW =
  '0 1px 1px rgba(30,20,10,0.18), 0 3px 6px -2px rgba(30,20,10,0.22), 0 14px 24px -12px rgba(30,20,10,0.35)';
