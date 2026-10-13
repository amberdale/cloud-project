import { Fragment } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowRight } from 'lucide-react';
import { ease } from '../../lib/motion';
import type { WorkspaceApi } from '../../lib/useWorkspace';
import { Workspace } from '../workspace/Workspace';
import { ButtonLink } from './Buttons';

const HEADLINE = ['We find what holds your', 'business back online,', 'and build what fixes it.'];

export function Hero({ ws }: { ws: WorkspaceApi }) {
  return (
    <section id="top" aria-labelledby="hero-title" className="mx-auto max-w-[1360px] px-4 pb-20 pt-6 sm:px-8 lg:pt-5">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10">
        <div className="lg:col-span-7">
          <motion.p
            className="label flex flex-wrap items-center gap-x-4 gap-y-2 text-graphite"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: ease.out, delay: 0.1 }}
          >
            <span>Independent web studio / Oslo</span>
            <span className="flex items-center gap-2 text-ribbon">
              <span className="h-1.5 w-1.5 bg-loden" aria-hidden />
              Taking projects for November
            </span>
          </motion.p>
          <h1
            id="hero-title"
            className="mt-4 font-serif text-[40px] leading-[1.02] tracking-[-0.015em] sm:text-[54px] lg:text-[48px] xl:text-[56px]"
            style={{ fontWeight: 400 }}
          >
            {HEADLINE.map((line, i) => (
              <span key={line} className="sm:block">
                {line.split(' ').map((word, j) => (
                  <Fragment key={j}>
                    <span className="inline-block overflow-hidden pb-[0.1em] align-top">
                      <motion.span
                        className="inline-block"
                        initial={{ y: '105%' }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.9, ease: ease.out, delay: 0.18 + i * 0.09 + j * 0.015 }}
                      >
                        {word}
                      </motion.span>
                    </span>{' '}
                  </Fragment>
                ))}
              </span>
            ))}
          </h1>
        </div>

        <motion.div
          className="lg:col-span-5 lg:pb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: ease.out, delay: 0.5 }}
        >
          <p className="max-w-[46ch] text-[18px] leading-[1.6] text-ribbon">
            Amberdale makes brands, websites and SaaS tools for businesses in Norway. Design and code from one studio, at a fixed price. Try all three below.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="#contact">
              Book a call
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
            </ButtonLink>
            <ButtonLink href="#services" variant="secondary">
              See what we make
              <ArrowDownRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:translate-y-0.5" aria-hidden />
            </ButtonLink>
          </div>
        </motion.div>
      </div>

      <motion.div
        id="workspace"
        className="mt-10 scroll-mt-6 lg:mt-8"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: ease.out, delay: 0.55 }}
      >
        <Workspace ws={ws} />
        <p className="mt-3 flex flex-wrap justify-between gap-2 font-mono text-[11px] text-graphite">
          <span>Mølle, Holm and Strøk are sample clients made for this page.</span>
          <span className="hidden sm:inline">Use ← → to switch demos</span>
        </p>
      </motion.div>
    </section>
  );
}
