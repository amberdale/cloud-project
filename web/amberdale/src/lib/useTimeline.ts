import { useEffect, useRef, useState } from 'react';
import { useIsPresent } from 'framer-motion';
import { useDemoChannel } from './channel';
import type { DemoId, RunMode } from './demo';

export interface TimelineStep {
  at: number;
  label: string;
}

interface Options {
  demo: DemoId;
  steps: TimelineStep[];
  duration: number;
  mode: RunMode;
  /** Re-render every `tick` ms with a fresh `t`. 0 re-renders only at step changes. */
  tick?: number;
  onComplete?: () => void;
}

/**
 * One clock per demo run. It drives a single rAF loop, publishes progress to
 * the workspace channel and stops as soon as the demo unmounts or starts its
 * exit animation, so nothing keeps typing after a tab change.
 */
export function useTimeline({ demo, steps, duration, mode, tick = 0, onComplete }: Options) {
  const channel = useDemoChannel();
  const isPresent = useIsPresent();
  const complete = mode === 'complete';
  const [state, setState] = useState(() => ({
    step: complete ? steps.length : 0,
    t: complete ? duration : 0,
  }));

  const stepsRef = useRef(steps);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!isPresent) return;
    const list = stepsRef.current;
    const publish = (step: number) =>
      channel.setMeta({
        demo,
        step,
        total: list.length,
        label: step >= list.length ? 'Complete' : list[step].label,
        status: step >= list.length ? 'complete' : 'running',
      });

    if (complete) {
      channel.progress.set(1);
      publish(list.length);
      return;
    }

    let raf = 0;
    let lastStep = -1;
    let lastT = -1;
    const start = performance.now();
    channel.progress.set(0);

    const frame = (now: number) => {
      const elapsed = Math.min(now - start, duration);
      const finished = elapsed >= duration;
      let step = 0;
      if (finished) step = list.length;
      else while (step + 1 < list.length && list[step + 1].at <= elapsed) step++;

      const t = finished ? duration : tick > 0 ? Math.floor(elapsed / tick) * tick : lastT;
      channel.progress.set(elapsed / duration);

      if (step !== lastStep || t !== lastT) {
        if (step !== lastStep) publish(step);
        lastStep = step;
        lastT = t;
        setState({ step, t: tick > 0 || finished ? t : 0 });
      }
      if (finished) onCompleteRef.current?.();
      else raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [isPresent, complete, duration, tick, demo, channel]);

  return { step: state.step, t: state.t, done: state.step >= steps.length };
}
