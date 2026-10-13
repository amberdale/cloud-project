import { ArrowUpRight, Mail, MapPin } from 'lucide-react';
import type { DemoId } from '../../lib/demo';
import type { WorkspaceApi } from '../../lib/useWorkspace';
import { Leaf } from '../brand/Leaf';
import { Wordmark } from '../brand/Wordmark';
import { ButtonLink } from './Buttons';

const SERVICES: { id: DemoId; index: string; title: string; problem: string; outcome: string }[] = [
  {
    id: 'branding',
    index: '01',
    title: 'Branding',
    problem: 'Your customers cannot tell what sets you apart.',
    outcome: 'We make it clear: a name, a mark, colour and type, and a guide your team can follow.',
  },
  {
    id: 'websites',
    index: '02',
    title: 'Websites',
    problem: 'You are hard to find, and the site looks older than the place.',
    outcome: 'We design and build a fast site that shows who you are, with booking and opening hours.',
  },
  {
    id: 'saas',
    index: '03',
    title: 'SaaS tools',
    problem: 'You spend hours every week on spreadsheets and manual work.',
    outcome: 'We build the tool that takes over. One job, done well, running in weeks.',
  },
];

function Eyebrow({ children }: { children: string }) {
  return <p className="label text-graphite">{children}</p>;
}

export function Services({ ws }: { ws: WorkspaceApi }) {
  return (
    <section id="services" aria-labelledby="services-title" className="mx-auto max-w-[1360px] scroll-mt-4 px-4 py-20 sm:px-8">
      <Eyebrow>01 / Services</Eyebrow>
      <h2 id="services-title" className="mt-4 max-w-[22ch] font-serif text-[34px] leading-[1.1] sm:text-[39px]" style={{ fontWeight: 400 }}>
        Three crafts, one studio, so it all fits.
      </h2>
      <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
        {SERVICES.map((s) => (
          <article key={s.id} className="border-t border-ribbon pt-5">
            <p className="font-mono text-[12px] text-cognac">{s.index}</p>
            <h3 className="mt-2 font-serif text-[31px] leading-[1.15]" style={{ fontWeight: 400 }}>
              {s.title}
            </h3>
            <p className="mt-3 text-[18px] leading-[1.55] text-graphite">{s.problem}</p>
            <p className="mt-2 text-[18px] leading-[1.55]">{s.outcome}</p>
            <a
              href="#workspace"
              onClick={() => ws.select(s.id)}
              className="group mt-5 inline-flex items-center gap-2 border-b border-rule-strong pb-1 font-mono text-[12px] uppercase tracking-[0.14em] transition-colors duration-200 hover:border-ribbon"
            >
              See it built
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

const TICKET = [
  ['Ref.', '0146'],
  ['Package', 'Standard'],
  ['Delivery', '2 weeks'],
];

export function Method() {
  return (
    <section id="method" aria-labelledby="method-title" className="mx-auto max-w-[1360px] scroll-mt-4 px-4 py-20 sm:px-8">
      <div className="hairline-dashed mb-20" />
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Eyebrow>02 / How we work</Eyebrow>
          <h2 id="method-title" className="mt-4 font-serif text-[34px] leading-[1.1] sm:text-[39px]" style={{ fontWeight: 400 }}>
            Fixed price, fixed scope.
          </h2>
          <dl className="mt-8">
            {[
              ['Problem first', 'We start with what holds you back: customers who cannot find you, or work that takes too long.'],
              ['Design and technology together', 'Brand, website and tools from the same studio, so the parts match.'],
              ['We look after it', 'A care plan with hosting, updates and a daily check that the site and forms work.'],
            ].map(([term, text], i) => (
              <div key={term} className="grid gap-1 border-t border-rule py-4 sm:grid-cols-[48px_1fr]">
                <dt className="font-mono text-[12px] text-graphite">0{i + 1}</dt>
                <dd>
                  <p className="font-serif text-[24px] leading-tight" style={{ fontWeight: 400 }}>
                    {term}
                  </p>
                  <p className="mt-1 text-[18px] leading-[1.55] text-graphite">{text}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <aside aria-label="Example order ticket" className="lg:col-span-5 lg:pt-14">
          <div className="border-t-2 border-ribbon font-mono text-[14px]">
            {TICKET.map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-dotted border-rule-strong py-3">
                <span>{k}</span>
                <span>{v}</span>
              </div>
            ))}
            <div className="flex items-baseline justify-between pt-4">
              <span>From</span>
              <span className="font-serif text-[44px] leading-none tnum" style={{ fontWeight: 400 }}>
                NOK 9,900
              </span>
            </div>
            <p className="mt-3 text-[12.5px] leading-[1.6] text-graphite">
              Excl. VAT. 50 % after the draft, 50 % when the site is approved. You know the price and the delivery date before we begin.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="on-loden scroll-mt-0 bg-loden text-bone">
      <div className="mx-auto max-w-[1360px] px-4 pb-10 pt-20 sm:px-8 sm:pt-28">
        <p className="label text-bone/80">In closing</p>
        <h2 id="contact-title" className="mt-6 max-w-[16ch] font-serif text-[44px] leading-[1.05] sm:text-[68px]" style={{ fontWeight: 400 }}>
          Tell us what you need help with.
        </h2>
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="mailto:ivan@amberdale.no?subject=New%20project" variant="onLoden">
            <Mail className="h-4 w-4" aria-hidden /> Book a call
          </ButtonLink>
        </div>
        <div className="mt-20 flex flex-col justify-between gap-8 border-t border-bone/30 pt-6 sm:flex-row sm:items-end">
          <address className="space-y-1 font-mono text-[13px] not-italic text-bone/90">
            <a href="mailto:ivan@amberdale.no" className="block w-fit hover:text-sage">
              ivan@amberdale.no
            </a>
            <span className="block">amberdale.no</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" aria-hidden /> Normannsgata 7A, 0655 Oslo
            </span>
          </address>
          <Wordmark reference="No. 0001 / Oslo" onLoden />
        </div>
        <div className="mt-10 flex justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-bone/70">
          <span className="flex items-center gap-2">
            <Leaf className="h-3.5 w-3.5" tone="sage" /> Amberdale / Est. 2026
          </span>
          <a href="#top" className="hover:text-bone">
            Back to top
          </a>
        </div>
      </div>
    </section>
  );
}
