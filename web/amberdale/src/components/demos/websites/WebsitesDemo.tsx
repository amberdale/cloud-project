import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleCheck, Code2, Lock, Monitor, RotateCw } from 'lucide-react';
import { caretLine, prepareCode } from '../../../lib/highlight';
import { useTimeline, type TimelineStep } from '../../../lib/useTimeline';
import { ease } from '../../../lib/motion';
import type { RunMode } from '../../../lib/demo';
import { CodeView } from '../../workspace/CodeView';
import { HOLM_SEGMENTS } from './code';
import { HolmSite } from './HolmSite';

const TYPE_MS = 7200;
const DURATION = 8100;
const LABELS = ['Scaffolding page', 'Writing navigation', 'Writing hero', 'Placing imagery', 'Adding call to action', 'Listing selected work', 'Writing footer'];

// Pure module-level setup: the document, where each section's code ends, and
// the timeline steps that follow the typing.
const DOC = prepareCode(HOLM_SEGMENTS.map((s) => s.code).join('\n'));
const SEGMENT_BOUNDS = (() => {
  let line = 0;
  return HOLM_SEGMENTS.map((s) => {
    const start = DOC.lines[line].offset;
    line += s.code.split('\n').length;
    const end = line < DOC.lines.length ? DOC.lines[line].offset : DOC.total;
    return { stage: s.stage, start, end };
  });
})();
const STEPS: TimelineStep[] = [
  ...SEGMENT_BOUNDS.map((b, i) => ({ at: Math.round((b.start / DOC.total) * TYPE_MS), label: LABELS[i] })),
  { at: TYPE_MS, label: 'Production build' },
];

interface DemoProps {
  mode: RunMode;
  onComplete: () => void;
}

export function WebsitesDemo({ mode, onComplete }: DemoProps) {
  const { t, done } = useTimeline({ demo: 'websites', steps: STEPS, duration: DURATION, mode, tick: 33, onComplete });
  const instant = mode === 'complete';
  const typed = Math.min(DOC.total, Math.floor((t / TYPE_MS) * DOC.total));
  const typingDone = typed >= DOC.total;
  const stage = useMemo(() => SEGMENT_BOUNDS.reduce((acc, b) => (typed >= b.end ? b.stage : acc), 0), [typed]);
  const [pane, setPane] = useState<'preview' | 'code'>('preview');

  const previewRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = previewRef.current;
    if (!el || instant) return;
    if (done) {
      el.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const section = el.querySelector<HTMLElement>(`[data-stage="${stage}"]`);
    if (section && stage > 2) el.scrollTo({ top: Math.max(0, section.offsetTop - 40), behavior: 'smooth' });
  }, [stage, done, instant]);

  const currentLine = DOC.lines[caretLine(DOC, typed)];
  const ticker = currentLine.tokens.map((tk) => tk.text).join('').trim();

  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row">
      {/* Small screens: a switch between the two panes. */}
      <div className="flex shrink-0 items-center justify-between border-b border-rule px-3 py-2 lg:hidden">
        <div role="group" aria-label="Show pane" className="flex border border-rule-strong font-mono text-[11px]">
          {(['preview', 'code'] as const).map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={pane === p}
              onClick={() => setPane(p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 uppercase tracking-[0.1em] transition-colors duration-200 ${
                pane === p ? 'bg-ribbon text-bone' : 'text-graphite hover:text-ribbon active:bg-sage'
              }`}
            >
              {p === 'preview' ? <Monitor className="h-3.5 w-3.5" aria-hidden /> : <Code2 className="h-3.5 w-3.5" aria-hidden />}
              {p}
            </button>
          ))}
        </div>
        <BuildBadge state={done ? 'done' : typingDone ? 'building' : 'dev'} />
      </div>

      <section
        aria-label="Code editor"
        className={`min-h-0 flex-col border-rule bg-paper lg:flex lg:w-[43%] lg:border-r ${pane === 'code' ? 'flex flex-1' : 'hidden'}`}
      >
        <div className="flex h-9 shrink-0 items-stretch justify-between border-b border-rule">
          <div className="flex font-mono text-[11.5px]">
            <span className="flex items-center gap-2 border-r border-rule bg-paper px-3 text-ribbon shadow-[inset_0_-2px_0_#1F1E1B]">
              page.tsx
              {!typingDone && <span className="h-1.5 w-1.5 bg-cognac" aria-label="unsaved" />}
            </span>
            <span className="hidden items-center border-r border-rule px-3 text-graphite sm:flex">Hero.tsx</span>
            <span className="hidden items-center border-r border-rule px-3 text-graphite xl:flex">tokens.css</span>
          </div>
          <div className="hidden items-center pr-3 lg:flex">
            <BuildBadge state={done ? 'done' : typingDone ? 'building' : 'dev'} />
          </div>
        </div>
        <CodeView doc={DOC} typed={typed} settled={typingDone} label="page.tsx source" className="min-h-0 flex-1" />
      </section>

      <section
        aria-label="Live preview"
        className={`min-h-0 flex-1 flex-col bg-[#ECE9DF] p-2.5 sm:p-3 lg:flex ${pane === 'preview' ? 'flex' : 'hidden'}`}
      >
        <div className="flex min-h-0 flex-1 flex-col border border-rule-strong bg-paper">
          <div className="flex h-9 shrink-0 items-center gap-3 border-b border-rule px-3">
            <RotateCw className="h-3.5 w-3.5 text-graphite" aria-hidden />
            <div className="flex h-6 flex-1 items-center gap-1.5 bg-bone px-2.5 font-mono text-[11px] text-graphite">
              <Lock className="h-3 w-3" aria-hidden />
              <span className="text-ribbon">holmarkitektur.no</span>
            </div>
            <span className="hidden font-mono text-[10.5px] text-graphite sm:inline">{stage === 0 ? 'waiting' : 'hot reload'}</span>
          </div>
          <div className="relative min-h-0 flex-1">
            <div ref={previewRef} className="scroll-quiet absolute inset-0 overflow-y-auto" tabIndex={0} aria-label="Holm Arkitektur preview, scrollable">
              <HolmSite stage={stage} instant={instant} />
            </div>
            <AnimatePresence>
              {stage === 0 && !instant && (
                <motion.div
                  className="absolute inset-0 grid place-items-center bg-paper"
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="font-mono text-[11px] text-graphite">Starting dev server on :3000</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        {/* On small screens the line being typed runs under the preview. */}
        <p className="mt-2 truncate font-mono text-[11px] text-graphite lg:hidden" aria-hidden>
          <span className="text-loden">›</span> {typingDone ? 'Build complete.' : ticker}
        </p>
      </section>
    </div>
  );
}

function BuildBadge({ state }: { state: 'dev' | 'building' | 'done' }) {
  const done = state === 'done';
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={state}
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -3 }}
        transition={{ duration: 0.25, ease: ease.out }}
        className={`flex items-center gap-1.5 font-mono text-[11px] ${done ? 'text-loden' : 'text-graphite'}`}
      >
        {done ? (
          <>
            <CircleCheck className="h-3.5 w-3.5" aria-hidden /> Built in 412 ms
          </>
        ) : (
          <>
            <span className="h-1.5 w-1.5 bg-graphite" aria-hidden /> {state === 'dev' ? 'dev / compiling' : 'vite build'}
          </>
        )}
      </motion.span>
    </AnimatePresence>
  );
}
