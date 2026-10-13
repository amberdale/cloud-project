import { useRef, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { DEMOS, type DemoId } from '../../lib/demo';

interface Props {
  active: DemoId;
  onSelect: (id: DemoId) => void;
}

export const tabId = (id: DemoId) => `workspace-tab-${id}`;
export const panelId = 'workspace-panel';

/** WAI-ARIA tabs with automatic activation and roving focus. */
export function WorkspaceTabs({ active, onSelect }: Props) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const index = DEMOS.findIndex((d) => d.id === active);
    const next =
      e.key === 'ArrowRight' ? (index + 1) % DEMOS.length
      : e.key === 'ArrowLeft' ? (index - 1 + DEMOS.length) % DEMOS.length
      : e.key === 'Home' ? 0
      : e.key === 'End' ? DEMOS.length - 1
      : -1;
    if (next < 0) return;
    e.preventDefault();
    onSelect(DEMOS[next].id);
    refs.current[DEMOS[next].id]?.focus();
  };

  return (
    <div role="tablist" aria-label="Studio demonstrations" onKeyDown={onKeyDown} className="flex h-full items-stretch">
      {DEMOS.map((d) => {
        const selected = d.id === active;
        return (
          <button
            key={d.id}
            ref={(el) => {
              refs.current[d.id] = el;
            }}
            id={tabId(d.id)}
            role="tab"
            type="button"
            aria-selected={selected}
            aria-controls={panelId}
            tabIndex={selected ? 0 : -1}
            onClick={() => onSelect(d.id)}
            className={`group relative flex flex-1 items-center justify-center gap-2 px-3 font-mono text-[12px] uppercase tracking-[0.12em] transition-colors duration-200 focus-visible:-outline-offset-2 sm:flex-none sm:px-5 ${
              selected ? 'text-ribbon' : 'text-graphite hover:text-ribbon active:text-ribbon'
            }`}
          >
            <span className={`text-[10px] transition-colors duration-200 ${selected ? 'text-cognac' : 'text-graphite/60 group-hover:text-graphite'}`}>
              {d.index}
            </span>
            {d.label}
            {selected && (
              <motion.span
                layoutId="workspace-tab-indicator"
                className="absolute inset-x-0 -bottom-px h-[2px] bg-ribbon"
                transition={{ type: 'spring', stiffness: 480, damping: 42 }}
              />
            )}
            <span
              aria-hidden
              className={`absolute inset-x-3 bottom-0 h-px origin-left scale-x-0 bg-rule-strong transition-transform duration-300 ${selected ? '' : 'group-hover:scale-x-100'}`}
            />
          </button>
        );
      })}
    </div>
  );
}
