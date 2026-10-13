import type { Transition, Variants } from 'framer-motion';

/** Restrained curves: a quick start that settles, never a bounce. */
export const ease = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
} as const;

export const tabTransition: Transition = { duration: 0.48, ease: ease.out };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.5, ease: ease.out } },
};

export const stagger = (gap = 0.06, delay = 0): Variants => ({
  hidden: {},
  shown: { transition: { staggerChildren: gap, delayChildren: delay } },
});
