import { memo, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck } from 'lucide-react';
import { useTimeline, type TimelineStep } from '../../../lib/useTimeline';
import { ease } from '../../../lib/motion';
import type { RunMode } from '../../../lib/demo';
import { ProgressMeter, StepList } from '../../workspace/StepList';
import { BreadBag, LoafPicture, MOLLE, MolleMark, PALETTE } from './molle';

const STEPS: TimelineStep[] = [
  { at: 0, label: 'Defining visual identity' },
  { at: 1100, label: 'Drawing the mark' },
  { at: 2600, label: 'Building colour system' },
  { at: 3800, label: 'Setting typography' },
  { at: 4900, label: 'Treating imagery' },
  { at: 6000, label: 'Assembling brand deck' },
];
const DURATION = 7600;

interface DemoProps {
  mode: RunMode;
  onComplete: () => void;
}

export function BrandingDemo({ mode, onComplete }: DemoProps) {
  const { step, done } = useTimeline({ demo: 'branding', steps: STEPS, duration: DURATION, mode, onComplete });
  const instant = mode === 'complete';

  return (
    <div className="flex h-full min-h-0">
      <aside className="hidden w-[248px] shrink-0 flex-col border-r border-rule bg-sage/70 p-5 lg:flex">
        <p className="label text-graphite">Brand deck</p>
        <h3 className="mt-2 font-serif text-[24px] leading-tight" style={{ fontWeight: 400 }}>
          Mølle Bakeri
        </h3>
        <p className="mt-1 font-mono text-[11px] text-graphite">Ref. 0143 / Grünerløkka, Oslo</p>
        <div className="my-4 hairline-dashed" />
        <StepList steps={STEPS} step={step} />
        <div className="mt-auto pt-5">
          <ProgressMeter />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-10 shrink-0 items-center justify-between border-b border-rule px-4 font-mono text-[11px] text-graphite">
          <span className="truncate uppercase tracking-[0.12em]">Mølle<span className="hidden sm:inline"> / Brand guidelines</span></span>
          <AnimatePresence mode="wait" initial={false}>
            {done ? (
              <motion.span
                key="ready"
                initial={instant ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: ease.out }}
                className="flex items-center gap-1.5 text-loden"
              >
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> v1.0<span className="hidden sm:inline"> / Ready for handover</span>
              </motion.span>
            ) : (
              <motion.span key="draft" exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
                Draft / page {String(Math.min(step + 1, 6)).padStart(2, '0')} of 06
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="scroll-quiet min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-px border border-rule bg-rule sm:grid-cols-6 lg:h-full lg:grid-cols-12 lg:grid-rows-[1.15fr_1fr]">
            <Tile index="01" name="Brief" shown={step >= 0} instant={instant} className="col-span-2 min-h-[170px] sm:col-span-3 lg:order-4 lg:col-span-3">
              <BriefTile />
            </Tile>
            <Tile index="02" name="Mark" shown={step >= 1} instant={instant} className="col-span-2 min-h-[220px] sm:col-span-3 lg:order-1 lg:col-span-5">
              <MarkTile instant={instant} />
            </Tile>
            <Tile index="03" name="Colour" shown={step >= 2} instant={instant} className="col-span-2 min-h-[180px] sm:col-span-3 lg:order-2 lg:col-span-4">
              <PaletteTile instant={instant} />
            </Tile>
            <Tile index="04" name="Type" shown={step >= 3} instant={instant} className="col-span-2 min-h-[180px] sm:col-span-3 lg:order-3 lg:col-span-3">
              <TypeTile />
            </Tile>
            <Tile index="05" name="Imagery" shown={step >= 4} instant={instant} className="col-span-1 min-h-[150px] sm:col-span-2 lg:order-5 lg:col-span-3">
              <ImageryTile instant={instant} />
            </Tile>
            <Tile index="06" name="Packaging" shown={step >= 5} instant={instant} className="col-span-1 min-h-[150px] sm:col-span-2 lg:order-6 lg:col-span-3">
              <PackagingTile />
            </Tile>
            <Tile index="07" name="Campaign" shown={step >= 5} instant={instant} delay={0.25} className="col-span-2 min-h-[150px] sm:col-span-2 lg:order-7 lg:col-span-3">
              <CampaignTile />
            </Tile>
          </div>
        </div>
      </div>
    </div>
  );
}

const Tile = memo(function Tile({
  index,
  name,
  shown,
  instant,
  delay = 0,
  className = '',
  children,
}: {
  index: string;
  name: string;
  shown: boolean;
  instant: boolean;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section aria-label={`${name} page`} className={`relative overflow-hidden bg-paper ${className}`}>
      {!shown && (
        <div className="absolute inset-2 flex items-end border border-dashed border-rule-strong p-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-graphite/70">
            {index} / {name}
          </span>
        </div>
      )}
      {shown && (
        <motion.div
          className="absolute inset-0"
          initial={instant ? false : { opacity: 0, y: 14, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: ease.out, delay }}
        >
          {children}
        </motion.div>
      )}
    </section>
  );
});

function Corner({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <span
      className="absolute left-3 top-3 font-mono text-[9.5px] uppercase tracking-[0.14em]"
      style={{ color: light ? MOLLE.flour : MOLLE.rye, opacity: 0.75 }}
    >
      {children}
    </span>
  );
}

function BriefTile() {
  return (
    <div className="flex h-full flex-col justify-end p-4 pt-10" style={{ background: MOLLE.rye, color: MOLLE.flour }}>
      <Corner light>Brief</Corner>
      <p className="font-fraunces text-[22px] leading-[1.05]" style={{ fontWeight: 400 }}>
        Warm.
        <br />
        Honest.
        <br />
        Early.
      </p>
      <p className="mt-2 max-w-[24ch] font-mono text-[10px] leading-[1.5] opacity-80">
        Up at 03:00 so the street smells of bread by seven.
      </p>
    </div>
  );
}

function MarkTile({ instant }: { instant: boolean }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center" style={{ background: MOLLE.flour }}>
      <Corner>Primary mark</Corner>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        initial={instant ? { opacity: 0 } : { opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: instant ? 0 : 1.4, duration: 0.6 }}
      >
        <div className="absolute left-1/2 top-0 h-full w-px border-l border-dashed" style={{ borderColor: `${MOLLE.crust}66` }} />
        <div className="absolute left-0 top-[42%] h-px w-full border-t border-dashed" style={{ borderColor: `${MOLLE.crust}66` }} />
      </motion.div>
      <MolleMark instant={instant} className="h-14 w-14 sm:h-16 sm:w-16" />
      <div className="mt-3 flex overflow-hidden" aria-label="Mølle">
        {'MØLLE'.split('').map((ch, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="font-fraunces text-[40px] leading-none sm:text-[46px]"
            style={{ color: MOLLE.rye, fontWeight: 600, letterSpacing: '0.04em' }}
            initial={instant ? false : { y: '105%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.55, ease: ease.out, delay: instant ? 0 : 0.7 + i * 0.06 }}
          >
            {ch}
          </motion.span>
        ))}
      </div>
      <p className="mt-2 font-mono text-[9.5px] uppercase tracking-[0.28em]" style={{ color: MOLLE.rye }}>
        Surdeigsbakeri / Grünerløkka
      </p>
      <span className="absolute bottom-3 right-3 font-mono text-[9.5px] uppercase tracking-[0.14em]" style={{ color: MOLLE.rye, opacity: 0.6 }}>
        Clear space 1×
      </span>
    </div>
  );
}

function PaletteTile({ instant }: { instant: boolean }) {
  return (
    <div className="flex h-full bg-paper">
      {PALETTE.map((c, i) => (
        <motion.div
          key={c.name}
          className="relative flex flex-col justify-end p-2"
          style={{ background: c.hex, color: c.ink, width: `${c.share}%`, originY: 1 }}
          initial={instant ? false : { scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.6, ease: ease.out, delay: instant ? 0 : i * 0.09 }}
        >
          <span className="font-fraunces text-[13px] leading-none" style={{ fontWeight: 600 }}>
            {c.name}
          </span>
          <span className="mt-1 font-mono text-[9px] opacity-80">{c.hex.slice(1)}</span>
        </motion.div>
      ))}
    </div>
  );
}

function TypeTile() {
  return (
    <div className="relative flex h-full flex-col justify-between p-4" style={{ color: MOLLE.rye }}>
      <Corner>Typography</Corner>
      <p className="mt-5 font-fraunces text-[60px] leading-[0.9]" style={{ fontWeight: 600 }}>
        Aa
      </p>
      <div>
        <p className="font-fraunces text-[15px]" style={{ fontWeight: 400 }}>
          Fraunces / display and menus
        </p>
        <p className="mt-0.5 font-mono text-[10px] opacity-75">DM Mono / prices and hours</p>
        <p className="mt-2 truncate font-fraunces text-[12px] opacity-70">ÆØÅ abcdefghijklm 0123456789</p>
      </div>
    </div>
  );
}

function ImageryTile({ instant }: { instant: boolean }) {
  return (
    <div className="relative h-full">
      <div className="absolute inset-0">
        <LoafPicture duotone={false} />
      </div>
      <motion.div
        className="absolute inset-0"
        initial={instant ? false : { clipPath: 'inset(0 100% 0 0)' }}
        animate={{ clipPath: 'inset(0 0% 0 0)' }}
        transition={{ duration: 0.9, ease: ease.inOut, delay: instant ? 0 : 0.35 }}
      >
        <LoafPicture duotone />
      </motion.div>
      <span className="absolute bottom-2 left-2 bg-[#F5F0E6]/90 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: MOLLE.rye }}>
        Duotone / Rye on Oat
      </span>
    </div>
  );
}

function PackagingTile() {
  return (
    <div className="relative flex h-full items-end justify-center gap-3 px-3 pb-3 pt-8" style={{ background: '#E9E1D1' }}>
      <Corner>Packaging</Corner>
      <div className="h-[82%]">
        <BreadBag />
      </div>
      <div
        className="mb-2 hidden h-[44%] w-[38%] flex-col justify-between p-2 shadow-[0_1px_0_rgba(43,31,23,0.15)] sm:flex"
        style={{ background: MOLLE.flour, transform: 'rotate(-4deg)' }}
      >
        <span className="font-fraunces text-[11px] leading-none" style={{ color: MOLLE.rye, fontWeight: 600 }}>
          Mølle
        </span>
        <span className="font-mono text-[7px] leading-tight" style={{ color: MOLLE.rye }}>
          Thorvald Meyers gate
          <br />
          07–15
        </span>
      </div>
    </div>
  );
}

function CampaignTile() {
  return (
    <div className="relative flex h-full flex-col justify-between p-4" style={{ background: MOLLE.crust, color: MOLLE.flour }}>
      <Corner light>Campaign</Corner>
      <p className="mt-6 font-fraunces text-[23px] leading-[1.02]" style={{ fontWeight: 600 }}>
        Bakt i natt.
        <br />
        Borte til lunsj.
      </p>
      <div className="flex items-end justify-between font-mono text-[9.5px] uppercase tracking-[0.14em]">
        <span>Åpent 07–15</span>
        <MolleMark instant className="h-6 w-6" color={MOLLE.flour} />
      </div>
    </div>
  );
}
