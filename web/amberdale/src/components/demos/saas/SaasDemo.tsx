import { AnimatePresence, motion } from 'framer-motion';
import { Check, MousePointerClick } from 'lucide-react';
import { prepareCode } from '../../../lib/highlight';
import { useTimeline, type TimelineStep } from '../../../lib/useTimeline';
import { ease } from '../../../lib/motion';
import type { RunMode } from '../../../lib/demo';
import { CodeView } from '../../workspace/CodeView';
import { StrokApp } from './StrokApp';
import type { QuoteState } from './useQuoteState';
// The editor shows the real pricing model that powers the calculator.
import quoteSource from './quote.ts?raw';

const DOC = prepareCode(quoteSource);
const TYPE_FROM = 600;
const TYPE_MS = 3200;
const DURATION = 5200;
const STEPS: TimelineStep[] = [
  { at: 0, label: 'Scaffolding QuoteForm' },
  { at: TYPE_FROM, label: 'Writing pricing model' },
  { at: TYPE_FROM + TYPE_MS, label: 'Running 12 tests' },
  { at: 4500, label: 'Deploying preview' },
];

const LOG = [
  { after: 1, text: 'scaffold', detail: 'QuoteForm.tsx, Summary.tsx' },
  { after: 2, text: 'tsc', detail: '0 errors' },
  { after: 3, text: 'vitest', detail: '12 passed in 412 ms' },
  { after: 4, text: 'deploy', detail: 'strok.app/q/2047' },
];

interface DemoProps {
  mode: RunMode;
  onComplete: () => void;
  quote: QuoteState;
}

export function SaasDemo({ mode, onComplete, quote }: DemoProps) {
  const { t, step, done } = useTimeline({ demo: 'saas', steps: STEPS, duration: DURATION, mode, tick: 33, onComplete });
  const instant = mode === 'complete';
  const typed = Math.min(DOC.total, Math.max(0, Math.floor(((t - TYPE_FROM) / TYPE_MS) * DOC.total)));
  const revealed = { shell: t >= 250, form: t >= 1500, summary: t >= 2700 };

  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row">
      <section aria-label="Simulated build" className="hidden min-h-0 flex-col border-r border-rule bg-paper lg:flex lg:w-[38%]">
        <div className="flex h-9 shrink-0 items-stretch justify-between border-b border-rule">
          <span className="flex items-center border-r border-rule px-3 font-mono text-[11.5px] text-ribbon shadow-[inset_0_-2px_0_#1F1E1B]">
            quote.ts
          </span>
          <span className="flex items-center pr-3 font-mono text-[10.5px] uppercase tracking-[0.12em] text-graphite">Simulated build</span>
        </div>
        <CodeView doc={DOC} typed={typed} settled={typed >= DOC.total} label="quote.ts source" className="min-h-0 flex-1" />
        <BuildLog step={step} done={done} instant={instant} className="border-t border-rule bg-bone/60 px-4 py-3" />
      </section>

      <section aria-label="Strøk, live tool" className="flex min-h-0 flex-1 flex-col bg-[#ECE9DF] p-2.5 sm:p-3">
        <div className="mb-2 flex shrink-0 items-center justify-between gap-3">
          <span className="flex items-center gap-2 font-mono text-[11px] text-ribbon">
            <span className="bg-loden px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-bone">Live</span>
            <span className="hidden sm:inline">This tool works. Change any field.</span>
            <span className="sm:hidden">Working tool</span>
          </span>
          <AnimatePresence initial={false}>
            {done && (
              <motion.span
                initial={instant ? false : { opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease: ease.out }}
                className="flex items-center gap-1.5 font-mono text-[11px] text-graphite"
              >
                <MousePointerClick className="h-3.5 w-3.5" aria-hidden /> strok.app/q/2047
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <BuildLog step={step} done={done} instant={instant} compact className="mb-2 lg:hidden" />
        <div className="min-h-0 flex-1">
          <StrokApp state={quote} revealed={revealed} instant={instant} />
        </div>
      </section>
    </div>
  );
}

function BuildLog({ step, done, instant, compact = false, className = '' }: { step: number; done: boolean; instant: boolean; compact?: boolean; className?: string }) {
  const finished = done ? LOG.length : Math.min(step, LOG.length - 1);
  const visible = compact ? LOG.slice(Math.max(0, finished - 1), finished + (done ? 0 : 1)) : LOG;
  return (
    <ul className={`font-mono text-[11px] leading-[20px] ${className}`} aria-label="Build log">
      {visible.map((line) => {
        const index = LOG.indexOf(line);
        const state = index < finished ? 'done' : index === finished ? 'running' : 'todo';
        return (
          <motion.li
            key={line.text}
            className="flex items-center gap-2"
            initial={instant ? false : { opacity: 0 }}
            animate={{ opacity: state === 'todo' ? 0.35 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className="grid w-3 place-items-center">
              {state === 'done' ? <Check className="h-3 w-3 text-loden" strokeWidth={2.5} aria-label="done" /> : <span className="text-graphite">·</span>}
            </span>
            <span className="w-14 text-ribbon">{line.text}</span>
            <span className="truncate text-graphite">{state === 'running' ? 'running' : line.detail}</span>
          </motion.li>
        );
      })}
    </ul>
  );
}
