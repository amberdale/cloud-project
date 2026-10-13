import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { Check, Copy, RotateCcw } from 'lucide-react';
import { ease } from '../../../lib/motion';
import type { Job, Paint, QuoteInput, quote } from './quote';
import type { QuoteState } from './useQuoteState';

/**
 * Strøk: a quote calculator for painting firms. Fully functional; the build
 * animation only decides when each part slides into view.
 */
const ACCENT = '#C9502A';
const nok = new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 });
const one = new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 1 });

const JOBS: { value: Job; label: string }[] = [
  { value: 'walls', label: 'Walls' },
  { value: 'ceilings', label: 'Ceilings' },
  { value: 'facade', label: 'Facade' },
];
const PAINTS: { value: Paint; label: string; price: number }[] = [
  { value: 'standard', label: 'Standard', price: 189 },
  { value: 'premium', label: 'Premium', price: 289 },
  { value: 'eco', label: 'Eco', price: 249 },
];

interface Props {
  state: QuoteState;
  /** How far the simulated build has come: 0 shell, 1 form, 2 summary. */
  revealed: { shell: boolean; form: boolean; summary: boolean };
  instant: boolean;
}

export function StrokApp({ state, revealed, instant }: Props) {
  const { input, result, update, reset } = state;
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-[#17181C]/12 bg-white font-grotesk text-[#17181C]">
      <Gate shown={revealed.shell} instant={instant} className="shrink-0" ghost="h-12 m-3">
        <header className="flex h-12 items-center justify-between border-b border-[#17181C]/8 px-4">
          <div className="flex items-center gap-3">
            <span className="relative text-[17px] font-semibold tracking-[-0.03em]">
              strøk
              <svg viewBox="0 0 40 6" className="absolute -bottom-1 left-0 h-1.5 w-full" aria-hidden>
                <path d="M1 4 C10 1, 22 5, 39 2" stroke={ACCENT} strokeWidth="2.4" fill="none" strokeLinecap="round" />
              </svg>
            </span>
            <span className="hidden text-[12px] text-[#17181C]/50 sm:inline">Quotes / Q-2047</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#17181C]/6 px-2 py-0.5 text-[11px] font-medium text-[#17181C]/70">Draft</span>
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[#E9E4DA] text-[10.5px] font-semibold" aria-hidden>
              KB
            </span>
          </div>
        </header>
      </Gate>

      <div className="scroll-quiet grid min-h-0 flex-1 gap-4 overflow-y-auto p-4 md:grid-cols-[1.15fr_1fr]">
        <Gate shown={revealed.form} instant={instant} ghost="h-full min-h-[280px]">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()} aria-label="Job details">
            <Segmented label="Job" name="job" options={JOBS} value={input.job} onChange={(v) => update('job', v)} />
            <AreaField value={input.area} onChange={(v) => update('area', v)} />
            <Segmented
              label="Coats"
              name="coats"
              options={[1, 2, 3].map((n) => ({ value: n as QuoteInput['coats'], label: String(n) }))}
              value={input.coats}
              onChange={(v) => update('coats', v)}
            />
            <fieldset>
              <legend className="mb-1.5 text-[11.5px] font-medium text-[#17181C]/60">Paint</legend>
              <div className="grid grid-cols-3 gap-1.5">
                {PAINTS.map((p) => (
                  <label key={p.value} className="group relative cursor-pointer">
                    <input
                      type="radio"
                      name="paint"
                      value={p.value}
                      checked={input.paint === p.value}
                      onChange={() => update('paint', p.value)}
                      className="peer sr-only"
                    />
                    <span className="block rounded-md border border-[#17181C]/12 px-2.5 py-2 transition-colors duration-150 group-hover:border-[#17181C]/35 peer-checked:border-[#17181C] peer-checked:bg-[#17181C]/[0.03] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#3D5A4B]">
                      <span className="block text-[12.5px] font-medium">{p.label}</span>
                      <span className="block text-[11px] text-[#17181C]/55 tnum">{p.price} kr/L</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="space-y-2">
              <Switch checked={input.prep} onChange={(v) => update('prep', v)} label="Sanding and filling" hint="0.06 h per m²" />
              <Switch checked={input.rush} onChange={(v) => update('rush', v)} label="Start within 7 days" hint="+15 % on labour" />
            </div>
          </form>
        </Gate>

        <Gate shown={revealed.summary} instant={instant} ghost="h-full min-h-[280px]" className="md:sticky md:top-0 md:self-start">
          <section aria-label="Quote summary" className="flex flex-col rounded-md bg-[#F5F3EE] p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-[11.5px] font-medium text-[#17181C]/60">Total incl. VAT</span>
              <span className="text-[11px] text-[#17181C]/50 tnum">{result.days} {result.days === 1 ? 'day' : 'days'} on site</span>
            </div>
            <p className="mt-1 text-[32px] font-semibold leading-none tracking-[-0.03em] tnum" aria-live="polite">
              <span className="mr-1.5 text-[15px] font-medium text-[#17181C]/55">NOK</span>
              <AnimatedNumber value={result.total} />
            </p>
            <dl className="mt-4 space-y-1.5 text-[12px] tnum">
              <Line term={`Labour, ${one.format(result.hours)} h`} value={result.labour} />
              <Line term={`Paint, ${result.litres} L`} value={result.materials} />
              {input.rush && <Line term="Rush start" value={result.surcharge} />}
              <div className="my-2 border-t border-dashed border-[#17181C]/15" />
              <Line term="Net" value={result.net} />
              <Line term="VAT 25 %" value={result.vat} />
            </dl>
            <div className="mt-5 flex gap-2">
              <CopyButton text={summaryText(input, result)} />
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#17181C]/15 px-3 py-2 text-[12px] font-medium transition-colors duration-150 hover:border-[#17181C]/40 active:bg-[#17181C]/5"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reset
              </button>
            </div>
          </section>
        </Gate>
      </div>
    </div>
  );
}

function Gate({ shown, instant, ghost, className = '', children }: { shown: boolean; instant: boolean; ghost: string; className?: string; children: ReactNode }) {
  if (!shown) return <div aria-hidden className={`rounded-md border border-dashed border-[#17181C]/15 ${ghost} ${className}`} />;
  return (
    <motion.div
      className={className}
      initial={instant ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: ease.out }}
    >
      {children}
    </motion.div>
  );
}

function Segmented<T extends string | number>({
  label,
  name,
  options,
  value,
  onChange,
}: {
  label: string;
  name: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-[11.5px] font-medium text-[#17181C]/60">{label}</legend>
      <div className="relative grid rounded-md bg-[#17181C]/[0.05] p-0.5" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
        {/* One pill slides under the options with a transform, no layout animation. */}
        <span
          aria-hidden
          className="absolute bottom-0.5 left-0.5 top-0.5 rounded-[5px] bg-[#17181C] transition-transform duration-300"
          style={{
            width: `calc((100% - 4px) / ${options.length})`,
            transform: `translateX(${Math.max(0, options.findIndex((o) => o.value === value)) * 100}%)`,
            transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
        {options.map((o) => {
          const checked = o.value === value;
          return (
            <label key={String(o.value)} className="relative cursor-pointer">
              <input type="radio" name={name} checked={checked} onChange={() => onChange(o.value)} className="peer sr-only" />
              <span
                className={`relative block rounded-[5px] py-1.5 text-center text-[12.5px] font-medium transition-colors duration-200 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-1 peer-focus-visible:outline-[#3D5A4B] ${
                  checked ? 'text-white' : 'text-[#17181C]/70 hover:text-[#17181C]'
                }`}
              >
                {o.label}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function AreaField({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const id = useId();
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const commit = (raw: string) => {
    const n = Math.round(Number(raw.replace(',', '.')));
    if (Number.isFinite(n) && n > 0) onChange(Math.min(1000, Math.max(1, n)));
    else setDraft(String(value));
  };
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={`${id}-n`} className="text-[11.5px] font-medium text-[#17181C]/60">
          Area to paint
        </label>
        <span className="flex items-center rounded-md border border-[#17181C]/12 focus-within:border-[#17181C]">
          <input
            id={`${id}-n`}
            inputMode="numeric"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              const n = Number(e.target.value);
              if (Number.isFinite(n) && n >= 1 && n <= 1000) onChange(Math.round(n));
            }}
            onBlur={(e) => commit(e.target.value)}
            className="w-14 bg-transparent py-1 pl-2 text-right text-[12.5px] font-medium outline-none tnum"
          />
          <span className="pl-1 pr-2 text-[12px] text-[#17181C]/50">m²</span>
        </span>
      </div>
      <input
        type="range"
        min={5}
        max={400}
        step={1}
        value={Math.min(400, value)}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Area in square metres"
        className="w-full"
        style={{ accentColor: ACCENT }}
      />
    </div>
  );
}

function Switch({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-1 py-1 hover:bg-[#17181C]/[0.03]">
      <span>
        <span className="block text-[12.5px] font-medium">{label}</span>
        <span className="block text-[11px] text-[#17181C]/55">{hint}</span>
      </span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className="relative h-5 w-9 shrink-0 rounded-full bg-[#17181C]/15 transition-colors duration-200 peer-checked:bg-[#17181C] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#3D5A4B]"
      >
        <span
          className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200"
          style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)', transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)' }}
        />
      </span>
    </label>
  );
}

function Line({ term, value }: { term: string; value: number }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-[#17181C]/65">{term}</dt>
      <dd className="font-medium">{nok.format(value)}</dd>
    </div>
  );
}

function AnimatedNumber({ value }: { value: number }) {
  const reduced = useReducedMotion();
  const spring = useSpring(value, { stiffness: 140, damping: 24, mass: 0.6 });
  const text = useTransform(spring, (v) => nok.format(Math.round(v)));
  useEffect(() => {
    if (reduced) spring.jump(value);
    else spring.set(value);
  }, [value, reduced, spring]);
  return <motion.span>{text}</motion.span>;
}

function CopyButton({ text }: { text: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<number>();
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch {
      setState('failed');
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState('idle'), 1800);
  };
  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-[12px] font-medium text-white transition-[background-color,transform] duration-150 active:scale-[0.98] ${
        state === 'copied' ? 'bg-[#2F5D45]' : 'bg-[#17181C] hover:bg-[#2C2D33]'
      }`}
    >
      {state === 'copied' ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
      <span aria-live="polite">{state === 'copied' ? 'Quote copied' : state === 'failed' ? 'Copy blocked' : 'Copy quote'}</span>
    </button>
  );
}

function summaryText(input: QuoteInput, r: ReturnType<typeof quote>) {
  return [
    'Quote Q-2047 (Strøk)',
    `${input.area} m² ${input.job}, ${input.coats} coat${input.coats > 1 ? 's' : ''}, ${input.paint} paint`,
    `Labour ${one.format(r.hours)} h: NOK ${nok.format(r.labour)}`,
    `Paint ${r.litres} L: NOK ${nok.format(r.materials)}`,
    ...(input.rush ? [`Rush start: NOK ${nok.format(r.surcharge)}`] : []),
    `Net NOK ${nok.format(r.net)} + VAT NOK ${nok.format(r.vat)}`,
    `Total NOK ${nok.format(r.total)}, ${r.days} day(s) on site`,
  ].join('\n');
}
