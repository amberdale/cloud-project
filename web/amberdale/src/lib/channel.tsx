import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { motionValue, type MotionValue } from 'framer-motion';
import type { DemoId } from './demo';

export interface DemoMeta {
  demo: DemoId;
  /** Index of the active step. Equals `total` once the run is complete. */
  step: number;
  total: number;
  label: string;
  status: 'running' | 'complete';
}

/**
 * The running demo publishes its progress here. Progress is a MotionValue so
 * bars and percentages update every frame without re-rendering React; the
 * step metadata changes only at step boundaries.
 */
export function createDemoChannel() {
  const progress: MotionValue<number> = motionValue(0);
  let meta: DemoMeta = { demo: 'branding', step: 0, total: 1, label: '', status: 'running' };
  const listeners = new Set<() => void>();
  return {
    progress,
    getMeta: () => meta,
    setMeta(next: DemoMeta) {
      if (
        next.demo === meta.demo &&
        next.step === meta.step &&
        next.total === meta.total &&
        next.label === meta.label &&
        next.status === meta.status
      )
        return;
      meta = next;
      listeners.forEach((l) => l());
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export type DemoChannel = ReturnType<typeof createDemoChannel>;

const ChannelContext = createContext<DemoChannel | null>(null);

export function DemoChannelProvider({ children }: { children: ReactNode }) {
  const channel = useMemo(createDemoChannel, []);
  return <ChannelContext.Provider value={channel}>{children}</ChannelContext.Provider>;
}

export function useDemoChannel() {
  const channel = useContext(ChannelContext);
  if (!channel) throw new Error('useDemoChannel needs a DemoChannelProvider');
  return channel;
}

export function useDemoMeta() {
  const channel = useDemoChannel();
  return useSyncExternalStore(channel.subscribe, channel.getMeta, channel.getMeta);
}
