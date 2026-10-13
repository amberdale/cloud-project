import { motion, useTransform } from 'framer-motion';
import { useDemoChannel, useDemoMeta } from '../../lib/channel';
import { DEMOS } from '../../lib/demo';

/** The bottom bar: current step, a progress rule and the open file. */
export function StatusBar() {
  const { progress } = useDemoChannel();
  const meta = useDemoMeta();
  const percent = useTransform(progress, (v) => `${Math.round(v * 100)}%`);
  const demo = DEMOS.find((d) => d.id === meta.demo)!;
  const complete = meta.status === 'complete';

  return (
    <div className="flex h-8 shrink-0 items-center gap-4 border-t border-rule bg-bone px-3 font-mono text-[11px] text-graphite sm:px-4">
      <span className="flex min-w-0 items-center gap-2" aria-live="polite">
        <span className="text-ribbon tnum">
          {String(Math.min(meta.step + 1, meta.total)).padStart(2, '0')}/{String(meta.total).padStart(2, '0')}
        </span>
        <span className="truncate">{complete ? 'Complete' : meta.label}</span>
      </span>
      <span className="relative hidden h-px flex-1 bg-rule sm:block" aria-hidden>
        <motion.span className="absolute inset-0 origin-left bg-loden" style={{ scaleX: progress }} />
      </span>
      <motion.span className="hidden w-9 text-right tnum sm:inline" aria-hidden>
        {percent}
      </motion.span>
      <span className="ml-auto hidden truncate md:inline sm:ml-0">{demo.file}</span>
    </div>
  );
}
