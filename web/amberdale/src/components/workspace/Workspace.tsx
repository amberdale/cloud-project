import { AnimatePresence, motion, useTransform } from 'framer-motion';
import { CircleCheck, FastForward, RotateCcw } from 'lucide-react';
import { useCallback } from 'react';
import { useDemoChannel, useDemoMeta } from '../../lib/channel';
import { DEMOS, type DemoId } from '../../lib/demo';
import { ease, tabTransition } from '../../lib/motion';
import type { WorkspaceApi } from '../../lib/useWorkspace';
import { Leaf } from '../brand/Leaf';
import { BrandingDemo } from '../demos/branding/BrandingDemo';
import { SaasDemo } from '../demos/saas/SaasDemo';
import { useQuoteState } from '../demos/saas/useQuoteState';
import { WebsitesDemo } from '../demos/websites/WebsitesDemo';
import { panelId, tabId, WorkspaceTabs } from './WorkspaceTabs';
import { StatusBar } from './StatusBar';

/**
 * The studio workspace: one window, three live demonstrations. Demo panels
 * share a fixed-height stage and cross-fade, so switching never shifts layout.
 */
export function Workspace({ ws }: { ws: WorkspaceApi }) {
  const quote = useQuoteState();
  const { active, run, complete } = ws;
  const onComplete = useCallback(() => complete(active, run.key), [complete, active, run.key]);
  const demo = DEMOS.find((d) => d.id === active)!;

  return (
    <div className="relative flex flex-col border border-ribbon bg-paper">
      <div className="flex shrink-0 flex-col border-b border-rule sm:h-12 sm:flex-row sm:items-stretch">
        <div className="flex h-11 items-center justify-between gap-3 border-b border-rule px-3 sm:h-auto sm:w-[30%] sm:border-b-0 sm:px-4">
          <span className="flex min-w-0 items-center gap-2 font-mono text-[11.5px]">
            <Leaf className="h-4 w-4 shrink-0" />
            <span className="text-ribbon">amberdale_</span>
            <span className="hidden truncate text-graphite md:inline">/ {demo.ref}</span>
          </span>
          <div className="sm:hidden">
            <RunControls ws={ws} />
          </div>
        </div>
        <div className="flex h-11 flex-1 justify-center sm:h-auto">
          <WorkspaceTabs active={active} onSelect={ws.select} />
        </div>
        <div className="hidden items-center justify-end gap-3 px-4 sm:flex sm:w-[30%]">
          <RunControls ws={ws} />
        </div>
      </div>

      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={tabId(active)}
        className="relative h-[620px] overflow-hidden sm:h-[600px] lg:h-[clamp(460px,calc(100svh-420px),640px)]"
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={`${active}-${run.key}`}
            className="absolute inset-0"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.28, ease: ease.inOut } }}
            transition={tabTransition}
          >
            <DemoView id={active} mode={run.mode} onComplete={onComplete} quote={quote} />
          </motion.div>
        </AnimatePresence>
      </div>

      <StatusBar />
    </div>
  );
}

function DemoView({ id, ...props }: { id: DemoId } & Parameters<typeof SaasDemo>[0]) {
  if (id === 'branding') return <BrandingDemo mode={props.mode} onComplete={props.onComplete} />;
  if (id === 'websites') return <WebsitesDemo mode={props.mode} onComplete={props.onComplete} />;
  return <SaasDemo {...props} />;
}

function RunControls({ ws }: { ws: WorkspaceApi }) {
  const meta = useDemoMeta();
  const { progress } = useDemoChannel();
  const percent = useTransform(progress, (v) => `${Math.round(v * 100)}%`);
  const complete = meta.status === 'complete' && meta.demo === ws.active;

  return (
    <div className="flex items-center gap-3 font-mono text-[11px]">
      <span className="flex items-center gap-1.5 text-graphite" aria-live="polite">
        {complete ? (
          <>
            <CircleCheck className="h-3.5 w-3.5 text-loden" aria-hidden />
            <span className="text-ribbon">Ready</span>
          </>
        ) : (
          <>
            <span className="relative h-2.5 w-2.5 border border-ribbon" aria-hidden>
              <motion.span className="absolute inset-0 origin-bottom bg-loden" style={{ scaleY: progress }} />
            </span>
            <span className="text-ribbon">Building</span>
            <motion.span className="w-8 tnum" aria-hidden>
              {percent}
            </motion.span>
          </>
        )}
      </span>
      {complete ? (
        ws.reduced ? null : (
          <ControlButton onClick={ws.replay} label="Replay this demo">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Replay
          </ControlButton>
        )
      ) : (
        <ControlButton onClick={ws.skip} label="Skip to the finished result">
          <FastForward className="h-3.5 w-3.5" aria-hidden /> Skip
        </ControlButton>
      )}
    </div>
  );
}

function ControlButton({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-7 items-center gap-1.5 border border-rule-strong px-2.5 uppercase tracking-[0.1em] text-ribbon transition-[background-color,border-color,transform] duration-150 hover:border-ribbon hover:bg-sage active:scale-[0.97]"
    >
      {children}
    </button>
  );
}
