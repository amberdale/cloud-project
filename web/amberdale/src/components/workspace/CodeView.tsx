import { memo, useEffect, useRef } from 'react';
import { caretLine, sliceTokens, type CodeDoc, type Token, type TokenKind } from '../../lib/highlight';

const tone: Record<TokenKind, string> = {
  plain: 'text-ribbon',
  kw: 'text-loden',
  str: 'text-cognac',
  tag: 'text-[#2D4D63]',
  attr: 'text-[#6B4E71]',
  fn: 'text-[#2D4D63]',
  num: 'text-cognac',
  com: 'text-graphite',
  punct: 'text-[#7C776D]',
};

function Tokens({ tokens }: { tokens: Token[] }) {
  return (
    <>
      {tokens.map((t, i) => (
        <span key={i} className={tone[t.kind]}>
          {t.text}
        </span>
      ))}
    </>
  );
}

const Row = memo(function Row({
  number,
  tokens,
  active,
  caret,
}: {
  number: number;
  tokens: Token[];
  active: boolean;
  caret: 'none' | 'solid' | 'blink';
}) {
  return (
    <div className={`flex ${active ? 'bg-sage/60' : ''}`}>
      <span
        aria-hidden
        className={`w-10 shrink-0 select-none pr-3 text-right tnum ${active ? 'text-ribbon' : 'text-graphite/60'}`}
      >
        {number}
      </span>
      <span className="whitespace-pre pr-4">
        <Tokens tokens={tokens} />
        {caret !== 'none' && (
          <span
            aria-hidden
            className={`-mb-[3px] ml-px inline-block h-[15px] w-[2px] bg-loden align-baseline ${caret === 'blink' ? 'caret-blink' : ''}`}
          />
        )}
      </span>
    </div>
  );
});

interface Props {
  doc: CodeDoc;
  typed: number;
  /** Typing has finished: the caret blinks at rest. */
  settled: boolean;
  label: string;
  className?: string;
}

/**
 * A read-only editor surface that reveals `doc` up to `typed` characters.
 * Finished lines are memoised, so only the line being typed re-renders.
 */
export function CodeView({ doc, typed, settled, label, className = '' }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const current = caretLine(doc, typed);

  useEffect(() => {
    const el = scroller.current;
    if (!el || settled) return;
    const row = el.querySelector<HTMLElement>(`[data-line="${current}"]`);
    if (!row) return;
    const target = row.offsetTop - el.clientHeight * 0.55;
    if (target > el.scrollTop) el.scrollTop = target;
  }, [current, settled]);

  return (
    <div
      ref={scroller}
      role="region"
      aria-label={label}
      tabIndex={0}
      className={`scroll-quiet overflow-auto py-3 font-mono text-[12.5px] leading-[21px] ${className}`}
    >
      <pre className="m-0 font-mono">
        <code>
          {doc.lines.slice(0, current + 1).map((line, i) => {
            const isCurrent = i === current;
            const visible = isCurrent ? line.indent + Math.max(0, typed - line.offset) : line.length;
            return (
              <div key={i} data-line={i}>
                <Row
                  number={i + 1}
                  tokens={isCurrent ? sliceTokens(line.tokens, visible) : line.tokens}
                  active={isCurrent}
                  caret={isCurrent ? (settled ? 'blink' : 'solid') : 'none'}
                />
              </div>
            );
          })}
        </code>
      </pre>
      <span className="sr-only">{settled ? 'Code complete.' : 'Code is being written.'}</span>
    </div>
  );
}
