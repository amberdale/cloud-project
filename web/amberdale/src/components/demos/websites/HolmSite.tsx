import { memo, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { ease } from '../../../lib/motion';

/**
 * Holm Arkitektur: a fictional Bergen practice. Each section appears when the
 * code that builds it has been typed (`stage`).
 */
const INK = '#1C1F1E';
const SAND = '#F2F0EB';

const PROJECTS = [
  { name: 'Hus Tveit', place: 'Voss', year: '2025', src: '/images/hus-tveit.webp', alt: 'A two-storey house clad in vertical timber' },
  { name: 'Sjøbu Austevoll', place: 'Austevoll', year: '2024', src: '/images/sjobu.webp', alt: 'Red boathouses on a rocky shore below mountains' },
  { name: 'Hytte Skarvet', place: 'Finse', year: '2023', src: '/images/skarvet.webp', alt: 'A small red cabin alone on a grassy ridge' },
];

/** The practice's own grade: cool, quiet, a little desaturated. */
const GRADE = { filter: 'saturate(0.78) contrast(0.96) brightness(1.02)' };

function Appear({ when, instant, children, className = '', y = 12 }: { when: boolean; instant: boolean; children: ReactNode; className?: string; y?: number }) {
  if (!when) return null;
  return (
    <motion.div
      className={className}
      initial={instant ? false : { opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: ease.out }}
    >
      {children}
    </motion.div>
  );
}

function Ghost({ className = '' }: { className?: string }) {
  return <div className={`border border-dashed border-[#1C1F1E]/15 ${className}`} />;
}

export const HolmSite = memo(function HolmSite({ stage, instant }: { stage: number; instant: boolean }) {
  return (
    <div className="font-grotesk" style={{ background: SAND, color: INK }}>
      {/* 1. Navigation */}
      <div data-stage="1" className="h-[52px] border-b border-[#1C1F1E]/10 px-6">
        <Appear when={stage >= 1} instant={instant} y={-6} className="flex h-full items-center justify-between">
          <span className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.02em]">
            <span className="grid h-5 w-5 place-items-center bg-[#1C1F1E] text-[10px] text-[#F2F0EB]">H</span>
            Holm Arkitektur
          </span>
          <span className="hidden gap-5 text-[12.5px] text-[#1C1F1E]/70 sm:flex">
            <span>Projects</span>
            <span>Practice</span>
            <span>Journal</span>
            <span className="text-[#1C1F1E]">Contact</span>
          </span>
        </Appear>
      </div>

      {/* 2. Hero copy, 4. call to action */}
      <div data-stage="2" className="grid gap-6 px-6 pb-6 pt-8 sm:grid-cols-[1.35fr_1fr] sm:items-end">
        {stage >= 2 ? (
          <div>
            <Appear when instant={instant}>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#1C1F1E]/55">Architects in Bergen since 2011</p>
            </Appear>
            <h4 className="mt-3 overflow-hidden text-[34px] font-medium leading-[1.02] tracking-[-0.035em] sm:text-[40px]">
              {['Houses that let', 'the landscape lead.'].map((line, i) => (
                <span key={line} className="block overflow-hidden pb-[0.06em]">
                  <motion.span
                    className="block"
                    initial={instant ? false : { y: '100%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.7, ease: ease.out, delay: instant ? 0 : 0.08 + i * 0.08 }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h4>
          </div>
        ) : (
          <div className="space-y-3">
            <Ghost className="h-3 w-40" />
            <Ghost className="h-20 w-full" />
          </div>
        )}
        <div data-stage="4" className="min-h-[96px]">
          {stage >= 2 && (
            <Appear when instant={instant}>
              <p className="text-[13px] leading-[1.55] text-[#1C1F1E]/75">
                Homes, cabins and boathouses on the west coast. Quiet buildings, made to stand a hundred winters.
              </p>
            </Appear>
          )}
          <Appear when={stage >= 4} instant={instant} className="mt-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#1C1F1E] py-2 pl-4 pr-3 text-[12.5px] font-medium text-[#F2F0EB]">
              Start a commission <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </span>
          </Appear>
        </div>
      </div>

      {/* 3. Imagery */}
      <div data-stage="3" className="px-6">
        {stage >= 3 ? (
          <figure>
            <motion.div
              className="relative aspect-[16/7] overflow-hidden will-change-transform"
              initial={instant ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: ease.out }}
            >
              <img
                src="/images/fjord.webp"
                alt="A fjord between steep green mountainsides, seen from above"
                className="absolute inset-0 h-full w-full object-cover"
                style={GRADE}
              />
            </motion.div>
            <figcaption className="mt-2 flex justify-between text-[11px] text-[#1C1F1E]/55">
              <span>Site visit above the fjord. October.</span>
              <span>01 / 12</span>
            </figcaption>
          </figure>
        ) : (
          <Ghost className="aspect-[16/7] w-full" />
        )}
      </div>

      {/* 5. Selected work */}
      <div data-stage="5" className="px-6 pb-8 pt-10">
        <div className="flex items-baseline justify-between border-b border-[#1C1F1E]/15 pb-2">
          <span className="text-[18px] font-medium tracking-[-0.02em]">{stage >= 5 ? 'Selected work' : ''}</span>
          {stage >= 5 && <span className="text-[11px] text-[#1C1F1E]/55">2023 to 2025</span>}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {PROJECTS.map((p, i) =>
            stage >= 5 ? (
              <motion.div
                key={p.name}
                initial={instant ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: ease.out, delay: instant ? 0 : i * 0.08 }}
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img src={p.src} alt={p.alt} loading="lazy" className="h-full w-full object-cover" style={GRADE} />
                </div>
                <p className="mt-2 text-[12.5px] font-medium leading-tight">{p.name}</p>
                <p className="text-[11px] text-[#1C1F1E]/55">
                  {p.place}, {p.year}
                </p>
              </motion.div>
            ) : (
              <Ghost key={p.name} className="aspect-[4/5]" />
            ),
          )}
        </div>
      </div>

      {/* 6. Footer */}
      <div data-stage="6" className="min-h-[150px]" style={{ background: INK, color: SAND }}>
        <Appear when={stage >= 6} instant={instant} className="px-6 py-7">
          <p className="text-[44px] font-semibold leading-none tracking-[-0.05em]">Holm</p>
          <div className="mt-6 flex flex-wrap justify-between gap-3 text-[11.5px] text-[#F2F0EB]/70">
            <span>Bryggen 12, 5003 Bergen</span>
            <span>studio@holmarkitektur.no</span>
            <span>Instagram / LinkedIn</span>
          </div>
        </Appear>
      </div>
    </div>
  );
});
