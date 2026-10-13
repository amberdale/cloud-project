import { motion, useTransform } from 'framer-motion';
import { Check } from 'lucide-react';
import { useDemoChannel } from '../../lib/channel';
import type { TimelineStep } from '../../lib/useTimeline';

/** The step checklist shared by the demos' side panels. */
export function StepList({ steps, step }: { steps: TimelineStep[]; step: number }) {
  return (
    <ol className="space-y-0">
      {steps.map((s, i) => {
        const state = i < step ? 'done' : i === step ? 'active' : 'todo';
        return (
          <li
            key={s.label}
            className="flex items-center gap-3 border-b border-rule py-2 font-mono text-[11.5px] last:border-b-0"
            aria-current={state === 'active' ? 'step' : undefined}
          >
            <span
              className={`grid h-4 w-4 shrink-0 place-items-center border ${
                state === 'done'
                  ? 'border-loden bg-loden text-bone'
                  : state === 'active'
                    ? 'border-ribbon'
                    : 'border-rule-strong'
              }`}
            >
              {state === 'done' && <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />}
              {state === 'active' && <span className="h-1.5 w-1.5 bg-ribbon" />}
            </span>
            <span className={state === 'todo' ? 'text-graphite/70' : 'text-ribbon'}>{s.label}</span>
            <span className="sr-only">{state === 'done' ? '(done)' : state === 'active' ? '(in progress)' : ''}</span>
          </li>
        );
      })}
    </ol>
  );
}

/** A hairline progress meter bound to the workspace clock. */
export function ProgressMeter({ className = '' }: { className?: string }) {
  const { progress } = useDemoChannel();
  const percent = useTransform(progress, (v) => `${Math.round(v * 100)}%`);
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative h-[3px] flex-1 overflow-hidden bg-rule">
        <motion.div className="absolute inset-0 origin-left bg-loden" style={{ scaleX: progress }} />
      </div>
      <motion.span className="w-9 text-right font-mono text-[11px] text-graphite tnum">{percent}</motion.span>
    </div>
  );
}
