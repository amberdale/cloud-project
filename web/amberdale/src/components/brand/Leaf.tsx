interface LeafProps {
  className?: string;
  /** Leaf colour. Cognac on light grounds, Sage on Loden. */
  tone?: 'cognac' | 'sage';
  title?: string;
}

/**
 * The wild cherry leaf (the Scottish gean). Stalk down to the left, tip up to
 * the right. Drawn as one component so the master SVG can replace it.
 */
export function Leaf({ className = 'h-6 w-6', tone = 'cognac', title }: LeafProps) {
  const fill = tone === 'cognac' ? '#97592B' : '#DFE7DC';
  const vein = tone === 'cognac' ? '#F2D9BF' : '#3D5A4B';
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path d="M4.5 45 C7 41.5 9.5 38.6 12.6 36" stroke={fill} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path
        d="M12.4 36.2 C9.4 30.6 10.1 23.4 15.1 17.6 C20.6 11.3 30.4 7.6 42.8 3.6 C39.3 14.6 35.6 24.6 29.4 30.4 C24.4 35.2 17.8 37.8 12.4 36.2 Z"
        fill={fill}
      />
      <g stroke={vein} strokeWidth="0.75" strokeLinecap="round" fill="none" opacity="0.85">
        <path d="M13 35.6 C21 27.4 30.4 16.4 41.4 5.4" />
        <path d="M17.4 31 L14.4 25.4 M21.6 26.6 L19.2 19.6 M26 21.8 L24.6 14.6 M30.6 16.8 L30.4 10.8" />
        <path d="M17.4 31 L23.2 31.4 M21.6 26.6 L28.2 26 M26 21.8 L32.6 20.4 M30.6 16.8 L36.4 14.6" />
      </g>
    </svg>
  );
}
