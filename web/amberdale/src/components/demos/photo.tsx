import { useId, type ReactNode } from 'react';

/**
 * Paper textures for the print mockups, rendered with SVG noise and lighting
 * filters so the mockups need no image files.
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
