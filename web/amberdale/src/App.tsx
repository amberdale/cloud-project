import { MotionConfig } from 'framer-motion';
import { DemoChannelProvider } from './lib/channel';
import { useWorkspace } from './lib/useWorkspace';
import { SiteHeader } from './components/site/SiteHeader';
import { Hero } from './components/site/Hero';
import { Contact, Method, Services } from './components/site/Sections';

export default function App() {
  const ws = useWorkspace('branding');
  return (
    <MotionConfig reducedMotion="user">
      <DemoChannelProvider>
        <a
          href="#main"
          className="sr-only z-50 bg-ribbon px-4 py-2 font-mono text-[12px] text-bone focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">
          <Hero ws={ws} />
          <Services ws={ws} />
          <Method />
        </main>
        <footer>
          <Contact />
        </footer>
      </DemoChannelProvider>
    </MotionConfig>
  );
}
