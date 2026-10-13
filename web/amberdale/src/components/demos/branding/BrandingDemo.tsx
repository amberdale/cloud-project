import { memo, type ReactNode } from 'react';
import { asset } from '../../../lib/asset';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck } from 'lucide-react';
import { useTimeline, type TimelineStep } from '../../../lib/useTimeline';
import { ease } from '../../../lib/motion';
import type { RunMode } from '../../../lib/demo';
import { ProgressMeter, StepList } from '../../workspace/StepList';
import { CottonPaper, KraftPaper } from '../photo';
import { MOLLE, PALETTE, PAPER_SHADOW } from './molle';

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
  // Guides sit on Fraunces' real metrics: line-height 1 puts the baseline at
  // 0.86em, the ascender at 0.12em and the x-height at 0.41em.
  const guides = [
    { top: '0.12em', label: 'Ascender' },
    { top: '0.41em', label: 'x-height' },
    { top: '0.86em', label: 'Baseline' },
  ];
  return (
    <div className="relative flex h-full flex-col items-center justify-center" style={{ background: MOLLE.flour }}>
      <Corner>Primary logotype</Corner>
      <div className="relative w-full text-[64px] leading-none sm:text-[78px]">
        {guides.map((g, i) => (
          <motion.div
            key={g.label}
            aria-hidden
            className="pointer-events-none absolute inset-x-0 flex items-center"
            style={{ top: g.top, height: 0, originX: 0 }}
            initial={instant ? false : { scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: ease.inOut, delay: instant ? 0 : i * 0.1 }}
          >
            <span className="h-px flex-1" style={{ background: `${MOLLE.crust}50` }} />
            <span className="px-2 font-mono text-[8.5px] uppercase tracking-[0.12em]" style={{ color: MOLLE.crust }}>
              {g.label}
            </span>
          </motion.div>
        ))}
        <div className="relative flex justify-center overflow-hidden" aria-label="Mølle">
          {'Mølle'.split('').map((ch, i) => (
            <motion.span
              key={i}
              aria-hidden
              className="font-fraunces"
              style={{ color: MOLLE.rye, fontWeight: 400, letterSpacing: '-0.02em', fontVariationSettings: '"opsz" 144' }}
              initial={instant ? false : { y: '100%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.7, ease: ease.out, delay: instant ? 0 : 0.5 + i * 0.06 }}
            >
              {ch}
            </motion.span>
          ))}
        </div>
      </div>
      <p className="relative mt-4 font-mono text-[9.5px] uppercase tracking-[0.3em]" style={{ color: MOLLE.rye }}>
        Surdeigsbakeri / Grünerløkka
      </p>
      <span className="absolute bottom-3 right-3 font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: MOLLE.rye, opacity: 0.6 }}>
        Fraunces 400 / opsz 144 / −20
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
          <span className="font-fraunces text-[13px] leading-none">{c.name}</span>
          <span className="mt-1.5 font-mono text-[8.5px] leading-[1.4] opacity-80">
            {c.hex}
            <br />
            <span className="hidden xl:inline">{c.cmyk}</span>
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function TypeTile() {
  return (
    <div className="relative flex h-full flex-col justify-between p-4" style={{ color: MOLLE.rye }}>
      <Corner>Typography</Corner>
      <p className="mt-6 font-fraunces text-[44px] leading-[0.95]" style={{ fontVariationSettings: '"opsz" 144' }}>
        Aa Øø
      </p>
      <div>
        <p className="font-fraunces text-[17px] leading-tight">Rugbrød, 06:40</p>
        <p className="mt-1 font-mono text-[9.5px] opacity-75">Fraunces / headings, menu board</p>
        <p className="font-mono text-[9.5px] opacity-75">DM Mono / prices, hours, labels</p>
      </div>
    </div>
  );
}

// The same frame before and after the brand grade: warmer, lower
// saturation, lifted shadows.
const RAW = 'saturate(1.08) contrast(1.04)';
const GRADED = 'sepia(0.28) saturate(0.72) contrast(0.9) brightness(1.04)';

function ImageryTile({ instant }: { instant: boolean }) {
  const photo = (filter: string) => (
    <img
      src={asset('images/rye-loaves.webp')}
      alt=""
      draggable={false}
      className="absolute inset-0 h-full w-full object-cover"
      style={{ filter }}
    />
  );
  return (
    <div className="relative h-full" role="img" aria-label="Rye loaves on a dark board, shown before and after the brand colour grade">
      {photo(RAW)}
      {/* Wipe from the raw frame to the graded one, using transforms only. */}
      <motion.div
        className="absolute inset-0 overflow-hidden will-change-transform"
        initial={instant ? false : { x: '-100%' }}
        animate={{ x: 0 }}
        transition={{ duration: 1.1, ease: ease.inOut, delay: instant ? 0 : 0.35 }}
      >
        <motion.div
          className="absolute inset-0 will-change-transform"
          initial={instant ? false : { x: '100%' }}
          animate={{ x: 0 }}
          transition={{ duration: 1.1, ease: ease.inOut, delay: instant ? 0 : 0.35 }}
        >
          {photo(GRADED)}
        </motion.div>
      </motion.div>
      <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/55 to-transparent" />
      <span className="absolute left-3 top-3 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#F5F0E6]">Art direction</span>
      <span className="absolute bottom-2 left-2 bg-[#F5F0E6]/90 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: MOLLE.rye }}>
        Warm grade / Rye shadows
      </span>
    </div>
  );
}

function PackagingTile() {
  return (
    <div className="relative h-full overflow-hidden">
      <CottonPaper className="absolute inset-0 h-full w-full" color="#D8D1C4" />
      <Corner>Packaging</Corner>
      {/* Bread bag, front face with gussets and a folded top. */}
      <div
        className="absolute bottom-[-6%] left-[12%] h-[82%] w-[44%] overflow-hidden"
        style={{ boxShadow: PAPER_SHADOW, transform: 'rotate(-2deg)' }}
      >
        <KraftPaper className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-y-0 left-0 w-[9%] bg-gradient-to-r from-black/25 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-[9%] bg-gradient-to-l from-black/30 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-[13%] bg-gradient-to-b from-black/20 to-transparent" />
        <div className="absolute inset-x-0 top-[13%] h-px bg-black/25" />
        <div className="absolute inset-x-0 top-[36%] text-center mix-blend-multiply" style={{ color: MOLLE.rye }}>
          <p className="font-fraunces text-[22px] leading-none opacity-90" style={{ fontVariationSettings: '"opsz" 144' }}>
            Mølle
          </p>
          <p className="mt-1.5 font-mono text-[5.5px] uppercase tracking-[0.3em] opacity-80">Surdeig / Oslo</p>
        </div>
      </div>
      {/* Business card resting against the bag. */}
      <div
        className="absolute bottom-[12%] right-[8%] hidden aspect-[85/55] w-[42%] overflow-hidden sm:block"
        style={{ boxShadow: PAPER_SHADOW, transform: 'rotate(5deg)' }}
      >
        <CottonPaper className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 flex flex-col justify-between p-2" style={{ color: MOLLE.rye }}>
          <span className="font-fraunces text-[11px] leading-none">Mølle</span>
          <span className="font-mono text-[5.5px] leading-[1.5]">
            Thorvald Meyers gate 40
            <br />
            Open 07–15
          </span>
        </div>
      </div>
    </div>
  );
}

function CampaignTile() {
  return (
    <div className="relative h-full overflow-hidden" style={{ background: '#C9C2B6' }}>
      <CottonPaper className="absolute inset-0 h-full w-full" color="#C9C2B6" />
      <Corner>Campaign</Corner>
      {/* A printed A3 poster pasted on a plaster wall. */}
      <div
        className="absolute inset-x-[14%] bottom-[8%] top-[20%] overflow-hidden"
        style={{ boxShadow: '0 1px 1px rgba(30,20,10,0.25), 0 8px 16px -10px rgba(30,20,10,0.45)' }}
      >
        <CottonPaper className="absolute inset-0 h-full w-full" color={MOLLE.crust} />
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/15" />
        <div className="absolute inset-0 flex flex-col justify-between p-3" style={{ color: MOLLE.flour }}>
          <p className="font-fraunces text-[19px] leading-[1.02]" style={{ fontVariationSettings: '"opsz" 144' }}>
            Bakt i natt.
            <br />
            Borte til lunsj.
          </p>
          <div className="flex items-end justify-between font-mono text-[7.5px] uppercase tracking-[0.14em]">
            <span>Åpent 07–15</span>
            <span className="font-fraunces text-[11px] normal-case tracking-normal">Mølle</span>
          </div>
        </div>
      </div>
    </div>
  );
}
