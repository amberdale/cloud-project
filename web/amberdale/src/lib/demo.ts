export type DemoId = 'branding' | 'websites' | 'saas';
export type RunMode = 'play' | 'complete';

export const DEMOS: { id: DemoId; label: string; index: string; ref: string; file: string }[] = [
  { id: 'branding', label: 'Branding', index: '01', ref: 'No. 0143 / Mølle', file: 'molle-guidelines.deck' },
  { id: 'websites', label: 'Websites', index: '02', ref: 'No. 0144 / Holm', file: 'holm/app/page.tsx' },
  { id: 'saas', label: 'SaaS', index: '03', ref: 'No. 0145 / Strøk', file: 'strok/src/quote.ts' },
];
