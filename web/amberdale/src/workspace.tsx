import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import { DemoChannelProvider } from './lib/channel';
import { useWorkspace } from './lib/useWorkspace';
import { Workspace } from './components/workspace/Workspace';
import './index.css';

/** The animated workspace on its own, for embedding in another page. */
function StandaloneWorkspace() {
  const ws = useWorkspace('branding');
  return (
    <MotionConfig reducedMotion="user">
      <DemoChannelProvider>
        <main className="mx-auto max-w-[1360px] px-4 py-4 sm:px-6 sm:py-6">
          <Workspace ws={ws} stageClassName="h-[620px] sm:h-[600px] lg:h-[clamp(480px,calc(100svh-150px),720px)]" />
          <p className="mt-3 flex flex-wrap justify-between gap-2 font-mono text-[11px] text-graphite">
            <span>Mølle, Holm and Strøk are sample clients made by Amberdale.</span>
            <span className="hidden sm:inline">Use ← → to switch demos</span>
          </p>
        </main>
      </DemoChannelProvider>
    </MotionConfig>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StandaloneWorkspace />
  </StrictMode>,
);
