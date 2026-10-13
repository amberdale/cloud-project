/** West-coast landscapes for the Holm preview, drawn in SVG (no image files). */
type Variant = 'dusk' | 'fjord' | 'snow' | 'coast';

const SCENES: Record<Variant, { sky: [string, string]; ridges: string[]; water: string; glow: string; building: 'aframe' | 'long' | 'boathouse' | 'tower' }> = {
  dusk: { sky: ['#C9B9A6', '#E8DED0'], ridges: ['#8C8E8C', '#5F6866', '#3A4442'], water: '#7D8A88', glow: '#F2C58A', building: 'aframe' },
  fjord: { sky: ['#B9C4C6', '#E4E6E1'], ridges: ['#9AA5A6', '#6C7A7B', '#455250'], water: '#6E8183', glow: '#F0D2A0', building: 'long' },
  snow: { sky: ['#D5D8D6', '#F0EFEA'], ridges: ['#E8E9E5', '#B4BAB8', '#7E8784'], water: '#9AA6A6', glow: '#F2C58A', building: 'tower' },
  coast: { sky: ['#C4C9C2', '#ECE8DE'], ridges: ['#A3A79B', '#767D70', '#4C5449'], water: '#7E8C86', glow: '#F0CC94', building: 'boathouse' },
};

export function Landscape({ variant, className = '' }: { variant: Variant; className?: string }) {
  const s = SCENES[variant];
  const id = `ls-${variant}`;
  return (
    <svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={s.sky[0]} />
          <stop offset="1" stopColor={s.sky[1]} />
        </linearGradient>
        <linearGradient id={`${id}-water`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={s.water} />
          <stop offset="1" stopColor={s.ridges[2]} />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill={`url(#${id}-sky)`} />
      <circle cx="300" cy="62" r="16" fill="#F7EEDF" opacity="0.7" />
      <path d="M0 120 L48 82 L92 104 L150 60 L214 102 L262 74 L318 98 L364 70 L400 88 L400 150 L0 150 Z" fill={s.ridges[0]} />
      <path d="M0 138 L60 106 L118 128 L176 94 L236 126 L300 104 L356 124 L400 112 L400 160 L0 160 Z" fill={s.ridges[1]} />
      <rect y="150" width="400" height="70" fill={`url(#${id}-water)`} />
      <path d="M0 150 L400 150" stroke="#F7EEDF" strokeOpacity="0.25" />
      <path d="M150 170 L250 170 M180 182 L230 182 M120 194 L170 194" stroke="#F7EEDF" strokeOpacity="0.18" strokeWidth="1.5" />
      <path d="M0 162 C60 148 110 150 160 158 L200 166 L200 220 L0 220 Z" fill={s.ridges[2]} />
      <Building kind={s.building} glow={s.glow} />
    </svg>
  );
}

function Building({ kind, glow }: { kind: 'aframe' | 'long' | 'boathouse' | 'tower'; glow: string }) {
  const ink = '#1F2421';
  switch (kind) {
    case 'aframe':
      return (
        <g transform="translate(70 118)">
          <path d="M0 40 L24 0 L48 40 Z" fill={ink} />
          <path d="M16 40 L24 22 L32 40 Z" fill={glow} />
          <path d="M-6 40 L54 40" stroke={ink} strokeWidth="2" />
        </g>
      );
    case 'long':
      return (
        <g transform="translate(46 132)">
          <path d="M0 12 L60 0 L120 12 L120 30 L0 30 Z" fill={ink} />
          <rect x="18" y="16" width="28" height="9" fill={glow} />
          <rect x="70" y="16" width="12" height="9" fill={glow} opacity="0.8" />
        </g>
      );
    case 'boathouse':
      return (
        <g transform="translate(110 128)">
          <path d="M0 14 L22 0 L44 14 L44 36 L0 36 Z" fill="#7A2E22" />
          <rect x="14" y="20" width="16" height="16" fill={ink} />
          <rect x="18" y="8" width="8" height="5" fill={glow} />
        </g>
      );
    case 'tower':
      return (
        <g transform="translate(84 112)">
          <rect x="0" y="0" width="26" height="48" fill={ink} />
          <rect x="6" y="8" width="14" height="10" fill={glow} />
          <rect x="6" y="26" width="14" height="6" fill={glow} opacity="0.7" />
        </g>
      );
  }
}
