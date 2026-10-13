import { motion } from 'framer-motion';
import { ease } from '../../../lib/motion';

/** Mølle Bakeri: the sample client brand assembled in the Branding demo. */
export const MOLLE = {
  rye: '#2B1F17',
  crust: '#B0532C',
  oat: '#E3D3B3',
  flour: '#F5F0E6',
  fjord: '#4F6670',
  kraft: '#C7A57E',
};

export const PALETTE = [
  { name: 'Flour', hex: MOLLE.flour, ink: MOLLE.rye, share: 30 },
  { name: 'Oat', hex: MOLLE.oat, ink: MOLLE.rye, share: 21 },
  { name: 'Crust', hex: MOLLE.crust, ink: MOLLE.flour, share: 19 },
  { name: 'Rye', hex: MOLLE.rye, ink: MOLLE.flour, share: 17 },
  { name: 'Fjord', hex: MOLLE.fjord, ink: MOLLE.flour, share: 13 },
];

/** The mill mark: a ring and four sails. Draws itself unless `instant`. */
export function MolleMark({ instant, className = 'h-16 w-16', color = MOLLE.rye }: { instant: boolean; className?: string; color?: string }) {
  const sail = 'M50 50 L50 14 L58 16 L58 44 Z';
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <motion.circle
        cx="50"
        cy="50"
        r="44"
        fill="none"
        stroke={color}
        strokeWidth="3"
        transform="rotate(-90 50 50)"
        initial={instant ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: ease.inOut }}
      />
      <motion.g
        initial={instant ? false : { rotate: -40, opacity: 0, scale: 0.6 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        style={{ originX: '50px', originY: '50px' }}
        transition={{ duration: 0.8, ease: ease.out, delay: instant ? 0 : 0.45 }}
      >
        {[0, 90, 180, 270].map((r) => (
          <path key={r} d={sail} fill={color} transform={`rotate(${r} 50 50)`} />
        ))}
        <circle cx="50" cy="50" r="5" fill={MOLLE.flour} stroke={color} strokeWidth="3" />
      </motion.g>
    </svg>
  );
}

/** A loaf on a board, drawn in SVG so it can carry a duotone treatment. */
export function LoafPicture({ duotone }: { duotone: boolean }) {
  const c = duotone
    ? { bg: MOLLE.oat, light: '#EFE4CC', board: '#8A5A3A', loaf: MOLLE.crust, deep: MOLLE.rye, score: '#E9D2AE' }
    : { bg: '#CFCBC4', light: '#E2DFDA', board: '#7D7A75', loaf: '#8F8B85', deep: '#4A4844', score: '#D6D3CE' };
  return (
    <svg viewBox="0 0 240 160" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id={`lp-light-${duotone}`} cx="0.3" cy="0.2" r="0.9">
          <stop offset="0" stopColor={c.light} />
          <stop offset="1" stopColor={c.bg} />
        </radialGradient>
        <radialGradient id={`lp-loaf-${duotone}`} cx="0.4" cy="0.3" r="0.8">
          <stop offset="0" stopColor={c.loaf} />
          <stop offset="1" stopColor={c.deep} />
        </radialGradient>
      </defs>
      <rect width="240" height="160" fill={`url(#lp-light-${duotone})`} />
      <path d="M0 118 L240 102 L240 160 L0 160 Z" fill={c.board} opacity="0.9" />
      <path d="M0 118 L240 102" stroke={c.deep} strokeOpacity="0.25" />
      <ellipse cx="124" cy="112" rx="70" ry="9" fill={c.deep} opacity="0.28" />
      <path d="M58 106 C54 74 86 52 126 52 C166 52 194 74 190 104 C176 114 74 116 58 106 Z" fill={`url(#lp-loaf-${duotone})`} />
      <g stroke={c.score} strokeWidth="3.4" strokeLinecap="round" fill="none" opacity="0.9">
        <path d="M84 84 C98 70 112 64 126 62" />
        <path d="M98 96 C116 80 138 72 160 70" />
        <path d="M126 100 C140 92 156 86 172 86" />
      </g>
      <g fill={c.light} opacity="0.7">
        <circle cx="40" cy="128" r="1.4" />
        <circle cx="206" cy="122" r="1.2" />
        <circle cx="196" cy="134" r="1" />
        <circle cx="52" cy="140" r="1" />
      </g>
    </svg>
  );
}

export function BreadBag() {
  return (
    <svg viewBox="0 0 120 150" className="h-full w-auto" aria-hidden>
      <path d="M16 22 L104 22 L110 146 L10 146 Z" fill={MOLLE.kraft} />
      <path d="M16 22 L104 22 L104 30 L16 30 Z" fill="#B48E66" />
      <path d="M16 22 l7 -8 l7 8 l7 -8 l7 8 l7 -8 l7 8 l7 -8 l7 8 l7 -8 l7 8 l7 -8 l7 8 l4 -5 L104 22 Z" fill="#B48E66" />
      <path d="M10 146 L110 146" stroke={MOLLE.rye} strokeOpacity="0.2" />
      <circle cx="60" cy="78" r="22" fill={MOLLE.flour} />
      <g transform="translate(46 64) scale(0.28)">
        <circle cx="50" cy="50" r="44" fill="none" stroke={MOLLE.crust} strokeWidth="5" />
        {[0, 90, 180, 270].map((r) => (
          <path key={r} d="M50 50 L50 14 L58 16 L58 44 Z" fill={MOLLE.crust} transform={`rotate(${r} 50 50)`} />
        ))}
      </g>
      <text x="60" y="118" textAnchor="middle" fontFamily="Fraunces, Georgia, serif" fontWeight="600" fontSize="13" letterSpacing="1.5" fill={MOLLE.rye}>
        MØLLE
      </text>
      <text x="60" y="130" textAnchor="middle" fontFamily="DM Mono, monospace" fontSize="5" letterSpacing="1.2" fill={MOLLE.rye} opacity="0.75">
        SURDEIG / OSLO
      </text>
    </svg>
  );
}
