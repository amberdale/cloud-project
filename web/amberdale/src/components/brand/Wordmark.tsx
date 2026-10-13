import { Leaf } from './Leaf';

interface Props {
  reference?: string;
  onLoden?: boolean;
  className?: string;
}

/** The leaf mark, or the ticket mark when a reference line is given. */
export function Wordmark({ reference, onLoden = false, className = '' }: Props) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Leaf className="h-[22px] w-[22px] shrink-0" tone={onLoden ? 'sage' : 'cognac'} />
      <span className="flex flex-col">
        <span
          className={`font-display text-[17px] leading-none tracking-mark ${onLoden ? 'text-bone' : 'text-ribbon'}`}
          style={{ fontWeight: 500 }}
        >
          AMBERDALE
        </span>
        {reference && (
          <span className={`mt-1 font-mono text-[8.5px] uppercase tracking-[0.3em] ${onLoden ? 'text-bone/80' : 'text-graphite'}`}>
            {reference}
          </span>
        )}
      </span>
    </span>
  );
}
