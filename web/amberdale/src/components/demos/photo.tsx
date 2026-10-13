import { useId, type ReactNode } from 'react';

/**
 * Photographic stand-ins rendered with SVG noise and lighting filters:
 * material close-ups and a misty landscape. They are drawn at load, need no
 * image files, and read as photographs at the sizes used in the demos.
 */

function useSvgId(prefix: string) {
  return `${prefix}${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
}

interface FrameProps {
  className?: string;
  children: (id: string) => ReactNode;
  prefix: string;
  viewBox?: string;
}

function Frame({ className = '', children, prefix, viewBox = '0 0 400 300' }: FrameProps) {
  const id = useSvgId(prefix);
  return (
    <svg viewBox={viewBox} preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      {children(id)}
    </svg>
  );
}

/** Fine film grain, laid over every photograph. */
function Grain({ id, opacity = 0.16, seed = 2 }: { id: string; opacity?: number; seed?: number }) {
  return (
    <>
      <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="2" seed={seed} stitchTiles="stitch" />
        <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 1.4 -0.45" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id}-grain)`} opacity={opacity} style={{ mixBlendMode: 'overlay' }} />
    </>
  );
}

/** Soft daylight from one side and a gentle lens vignette. */
function Light({ id, from = 'tl', strength = 0.5 }: { id: string; from?: 'tl' | 'tr' | 'l'; strength?: number }) {
  const cx = from === 'tr' ? 0.85 : from === 'l' ? 0 : 0.15;
  const cy = from === 'l' ? 0.5 : 0.1;
  return (
    <>
      <radialGradient id={`${id}-light`} cx={cx} cy={cy} r="1.1">
        <stop offset="0" stopColor="#fff" stopOpacity={0.28 * strength * 2} />
        <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity={0.45 * strength} />
      </radialGradient>
      <rect width="100%" height="100%" fill={`url(#${id}-light)`} style={{ mixBlendMode: 'soft-light' }} />
      <rect width="100%" height="100%" fill={`url(#${id}-light)`} opacity="0.5" />
    </>
  );
}

/** Dark oak board with a heap of rye flour and a finger drawn through it. */
export function FlourOnBoard({ className = '', tone = 'natural' }: { className?: string; tone?: 'natural' | 'duotone' }) {
  const duo = tone === 'duotone';
  const wood = duo ? '#3A2618' : '#3B3530';
  const flour = duo ? '#EBDDC3' : '#E6E3DE';
  const pile = (
    <>
      <ellipse cx="244" cy="146" rx="78" ry="54" />
      <ellipse cx="226" cy="160" rx="54" ry="40" />
    </>
  );
  return (
    <Frame prefix="flour" className={className}>
      {(id) => (
        <>
          <defs>
            <filter id={`${id}-grainwood`} x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.004 0.11" numOctaves="4" seed="7" />
              <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1.6 0 0 0 1.05" />
            </filter>
            <filter id={`${id}-heap`} x="-30%" y="-30%" width="160%" height="160%">
              <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="4" seed="4" result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="34" />
              <feGaussianBlur stdDeviation="3.2" />
            </filter>
            <filter id={`${id}-halo`} x="-40%" y="-40%" width="180%" height="180%">
              <feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="4" seed="31" result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="46" />
              <feGaussianBlur stdDeviation="10" />
            </filter>
            <filter id={`${id}-powder`} x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="4" seed="19" />
              <feDiffuseLighting surfaceScale="2.2" lightingColor="#fff">
                <feDistantLight azimuth="225" elevation="48" />
              </feDiffuseLighting>
            </filter>
            <filter id={`${id}-specks`} x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="1.15" numOctaves="1" seed="23" />
              <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 22 -15.6" />
            </filter>
            <filter id={`${id}-trail`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.6" />
            </filter>
            <radialGradient id={`${id}-scatter`} cx="0.59" cy="0.5" r="0.42">
              <stop offset="0.3" stopColor="#fff" stopOpacity="1" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <mask id={`${id}-heapmask`}>
              <g fill="#fff" filter={`url(#${id}-heap)`}>{pile}</g>
            </mask>
            <mask id={`${id}-scattermask`}>
              <rect width="400" height="300" fill={`url(#${id}-scatter)`} />
            </mask>
          </defs>
          <rect width="400" height="300" fill={wood} />
          <rect width="400" height="300" filter={`url(#${id}-grainwood)`} opacity="0.55" />
          <path d="M0 96 L400 92 M0 212 L400 216" stroke="#000" strokeOpacity="0.45" strokeWidth="1.2" />
          <rect width="400" height="300" fill={flour} filter={`url(#${id}-specks)`} mask={`url(#${id}-scattermask)`} opacity="0.9" />
          <ellipse cx="236" cy="152" rx="112" ry="80" fill={flour} opacity="0.5" filter={`url(#${id}-halo)`} />
          <g fill={flour} filter={`url(#${id}-heap)`}>{pile}</g>
          <rect width="400" height="300" filter={`url(#${id}-powder)`} mask={`url(#${id}-heapmask)`} opacity="0.55" style={{ mixBlendMode: 'multiply' }} />
          <path
            d="M176 190 C200 186 214 160 238 156 C262 152 270 132 300 124"
            stroke={wood}
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
            opacity="0.42"
            filter={`url(#${id}-trail)`}
          />
          <Light id={id} from="tl" strength={0.6} />
          <Grain id={id} opacity={0.18} />
        </>
      )}
    </Frame>
  );
}

/** Kraft paper with long fibres and light creasing. */
export function KraftPaper({ className = '', color = '#B08A62' }: { className?: string; color?: string }) {
  return (
    <Frame prefix="kraft" className={className}>
      {(id) => (
        <>
          <defs>
            <filter id={`${id}-fibre`} x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.9 0.06" numOctaves="2" seed="5" />
              <feColorMatrix values="0 0 0 0 0.25  0 0 0 0 0.16  0 0 0 0 0.08  0 0 0 1.2 -0.5" />
            </filter>
            <filter id={`${id}-crease`} x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="9" />
              <feDiffuseLighting surfaceScale="3.5" lightingColor="#fff">
                <feDistantLight azimuth="235" elevation="55" />
              </feDiffuseLighting>
            </filter>
          </defs>
          <rect width="400" height="300" fill={color} />
          <rect width="400" height="300" filter={`url(#${id}-crease)`} opacity="0.5" style={{ mixBlendMode: 'multiply' }} />
          <rect width="400" height="300" filter={`url(#${id}-fibre)`} opacity="0.5" />
          <Grain id={id} opacity={0.25} seed={6} />
        </>
      )}
    </Frame>
  );
}

/** Uncoated cotton card stock: almost flat, with a faint felt. */
export function CottonPaper({ className = '', color = '#F5F0E6' }: { className?: string; color?: string }) {
  return (
    <Frame prefix="cotton" className={className}>
      {(id) => (
        <>
          <defs>
            <filter id={`${id}-felt`} x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="4" seed="3" />
              <feDiffuseLighting surfaceScale="0.9" lightingColor="#fff">
                <feDistantLight azimuth="225" elevation="62" />
              </feDiffuseLighting>
            </filter>
          </defs>
          <rect width="400" height="300" fill={color} />
          <rect width="400" height="300" filter={`url(#${id}-felt)`} opacity="0.32" style={{ mixBlendMode: 'multiply' }} />
        </>
      )}
    </Frame>
  );
}

/** Board-formed concrete under raking light. */
export function Concrete({ className = '' }: { className?: string }) {
  return (
    <Frame prefix="concrete" className={className} viewBox="0 0 300 375">
      {(id) => (
        <>
          <defs>
            <filter id={`${id}-relief`} x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="5" seed="21" />
              <feDiffuseLighting surfaceScale="0.9" lightingColor="#fff">
                <feDistantLight azimuth="200" elevation="38" />
              </feDiffuseLighting>
            </filter>
            <filter id={`${id}-mottle`} x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves="3" seed="8" />
              <feColorMatrix values="0 0 0 0 0.2  0 0 0 0 0.19  0 0 0 0 0.17  1.4 0 0 0 -0.55" />
            </filter>
            <linearGradient id={`${id}-shadow`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0.48" stopColor="#000" stopOpacity="0" />
              <stop offset="0.5" stopColor="#000" stopOpacity="0.42" />
              <stop offset="1" stopColor="#000" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <rect width="300" height="375" fill="#A9A59D" />
          <rect width="300" height="375" filter={`url(#${id}-relief)`} opacity="0.75" style={{ mixBlendMode: 'multiply' }} />
          <rect width="300" height="375" filter={`url(#${id}-mottle)`} opacity="0.5" />
          {[62, 124, 186, 248, 310].map((y) => (
            <path key={y} d={`M0 ${y} L300 ${y + 1}`} stroke="#000" strokeOpacity="0.12" />
          ))}
          <rect width="300" height="375" fill={`url(#${id}-shadow)`} />
          <Grain id={id} opacity={0.2} seed={4} />
        </>
      )}
    </Frame>
  );
}

/** Vertical larch cladding, weathered silver, low sun across it. */
export function TimberCladding({ className = '', tone = 'silver' }: { className?: string; tone?: 'silver' | 'fresh' }) {
  const fresh = tone === 'fresh';
  const boards = Array.from({ length: 9 }, (_, i) => i);
  return (
    <Frame prefix="timber" className={className} viewBox="0 0 300 375">
      {(id) => (
        <>
          <defs>
            <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.5 0.008" numOctaves="4" seed="13" />
              <feColorMatrix values="0 0 0 0 0.1  0 0 0 0 0.08  0 0 0 0 0.06  1.5 0 0 0 -0.55" />
            </filter>
            <linearGradient id={`${id}-sun`} x1="0" y1="0" x2="1" y2="0.4">
              <stop offset="0" stopColor="#FFF4DC" stopOpacity="0.35" />
              <stop offset="0.55" stopColor="#FFF4DC" stopOpacity="0" />
              <stop offset="0.56" stopColor="#0B0F12" stopOpacity="0.32" />
              <stop offset="1" stopColor="#0B0F12" stopOpacity="0.45" />
            </linearGradient>
          </defs>
          {boards.map((i) => {
            const shade = fresh ? ['#A57B52', '#9C7249', '#AE865D'][i % 3] : ['#8E8C86', '#85837D', '#96938C'][i % 3];
            return <rect key={i} x={i * 34} width="33" height="375" fill={shade} />;
          })}
          <rect width="300" height="375" filter={`url(#${id}-grain)`} opacity="0.85" />
          {boards.map((i) => (
            <rect key={i} x={i * 34 + 33} width="1.6" height="375" fill="#1A1714" opacity="0.7" />
          ))}
          <rect width="300" height="375" fill={`url(#${id}-sun)`} />
          <Grain id={id} opacity={0.22} seed={9} />
        </>
      )}
    </Frame>
  );
}

/** Slate tiles on a roof, overlapping rows, wet light. */
export function SlateRoof({ className = '' }: { className?: string }) {
  const rows = Array.from({ length: 12 }, (_, i) => i);
  return (
    <Frame prefix="slate" className={className} viewBox="0 0 300 375">
      {(id) => (
        <>
          <defs>
            <filter id={`${id}-cleft`} x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.06 0.3" numOctaves="4" seed="17" />
              <feDiffuseLighting surfaceScale="1.2" lightingColor="#fff">
                <feDistantLight azimuth="250" elevation="45" />
              </feDiffuseLighting>
            </filter>
            <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#D9DEE0" stopOpacity="0.35" />
              <stop offset="1" stopColor="#000" stopOpacity="0.35" />
            </linearGradient>
          </defs>
          <rect width="300" height="375" fill="#4A4F52" />
          {rows.map((r) => (
            <g key={r}>
              {Array.from({ length: 7 }, (_, c) => (
                <rect
                  key={c}
                  x={c * 46 - (r % 2 ? 23 : 0) + ((r * 7 + c * 3) % 5)}
                  y={r * 32}
                  width="44"
                  height="40"
                  fill={['#51575B', '#474C50', '#5A5F62', '#4C5256'][(r + c) % 4]}
                />
              ))}
              <rect y={r * 32 + 30} width="300" height="2.5" fill="#15181A" opacity="0.55" />
            </g>
          ))}
          <rect width="300" height="375" filter={`url(#${id}-cleft)`} style={{ mixBlendMode: 'multiply' }} opacity="0.75" />
          <rect width="300" height="375" fill={`url(#${id}-sheen)`} />
          <Grain id={id} opacity={0.2} seed={12} />
        </>
      )}
    </Frame>
  );
}

// Seeded value noise for organic ridgelines.
function ridge(seed: number, base: number, amp: number, rough: number, width = 800, height = 400) {
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const octaves = [0.5, 0.25, 0.12, 0.06].map(() => Array.from({ length: 40 }, rand));
  const at = (x: number) => {
    let v = 0;
    octaves.forEach((pts, o) => {
      const f = (x / width) * (3 + o * 5);
      const i = Math.floor(f);
      const t = f - i;
      const smooth = t * t * (3 - 2 * t);
      v += (pts[i % 40] * (1 - smooth) + pts[(i + 1) % 40] * smooth) * (o === 0 ? 1 : rough / (o + 1));
    });
    return v;
  };
  let d = `M0 ${height}`;
  for (let x = 0; x <= width; x += 4) d += ` L${x} ${(base - at(x) * amp).toFixed(1)}`;
  return `${d} L${width} ${height} Z`;
}

const RIDGES = [
  { d: ridge(11, 210, 110, 0.5), fill: '#A8AEAD', blur: 2.4 },
  { d: ridge(29, 250, 95, 0.7), fill: '#7F8887', blur: 1.3 },
  { d: ridge(53, 292, 70, 1.1), fill: '#4D5755', blur: 0.6 },
];

/** A west-coast fjord in low cloud: atmospheric depth, water, film grain. */
export function MistyFjord({ className = '' }: { className?: string }) {
  return (
    <Frame prefix="fjord" className={className} viewBox="0 0 800 400">
      {(id) => (
        <>
          <defs>
            <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#B9BDBA" />
              <stop offset="0.6" stopColor="#D6D6CF" />
              <stop offset="1" stopColor="#CFCFC7" />
            </linearGradient>
            <linearGradient id={`${id}-fog`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#DADAD3" stopOpacity="0" />
              <stop offset="0.7" stopColor="#DADAD3" stopOpacity="0.85" />
              <stop offset="1" stopColor="#DADAD3" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`${id}-water`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#9DA4A2" />
              <stop offset="1" stopColor="#4E5856" />
            </linearGradient>
            <filter id={`${id}-cloud`} x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.004 0.012" numOctaves="4" seed="3" />
              <feColorMatrix values="0 0 0 0 0.92  0 0 0 0 0.92  0 0 0 0 0.9  1.6 0 0 0 -0.75" />
            </filter>
            <filter id={`${id}-ripple`} x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.002 0.16" numOctaves="2" seed="5" result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="9" />
              <feGaussianBlur stdDeviation="1.6" />
            </filter>
            {RIDGES.map((r, i) => (
              <filter key={i} id={`${id}-b${i}`} x="-5%" y="-5%" width="110%" height="110%">
                <feGaussianBlur stdDeviation={r.blur} />
              </filter>
            ))}
            <clipPath id={`${id}-above`}>
              <rect width="800" height="300" />
            </clipPath>
          </defs>
          <rect width="800" height="400" fill={`url(#${id}-sky)`} />
          <rect width="800" height="260" filter={`url(#${id}-cloud)`} opacity="0.7" />
          <g clipPath={`url(#${id}-above)`}>
            {RIDGES.map((r, i) => (
              <g key={i}>
                <path d={r.d} fill={r.fill} filter={`url(#${id}-b${i})`} />
                {i < RIDGES.length - 1 && <rect y={170 + i * 40} width="800" height="120" fill={`url(#${id}-fog)`} opacity={0.75 - i * 0.2} />}
              </g>
            ))}
          </g>
          <rect y="300" width="800" height="100" fill={`url(#${id}-water)`} />
          <g transform="translate(0 600) scale(1 -1)" opacity="0.38" filter={`url(#${id}-ripple)`}>
            {RIDGES.map((r, i) => (
              <path key={i} d={r.d} fill={r.fill} clipPath={`url(#${id}-above)`} />
            ))}
          </g>
          <rect y="298" width="800" height="6" fill="#DADAD3" opacity="0.5" filter={`url(#${id}-b0)`} />
          <Light id={id} from="tr" strength={0.35} />
          <Grain id={id} opacity={0.24} seed={14} />
        </>
      )}
    </Frame>
  );
}
