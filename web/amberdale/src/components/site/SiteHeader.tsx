import { motion } from 'framer-motion';
import { ease } from '../../lib/motion';
import { Wordmark } from '../brand/Wordmark';

const LINKS = [
  { href: '#services', label: 'Services' },
  { href: '#method', label: 'Prices' },
  { href: '#contact', label: 'Contact' },
];

export function SiteHeader() {
  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: ease.out }}
      className="mx-auto flex h-16 max-w-[1360px] items-center justify-between px-4 sm:px-8"
    >
      <a href="/" aria-label="Amberdale, home" className="-m-1 p-1">
        <Wordmark />
      </a>
      <nav aria-label="Main">
        <ul className="flex items-center gap-1 font-mono text-[12px] uppercase tracking-[0.14em]">
          {LINKS.map((l) => (
            <li key={l.href} className={l.href === '#contact' ? '' : 'hidden sm:block'}>
              <a href={l.href} className="relative block px-3 py-2 text-ribbon transition-colors duration-200 hover:text-graphite">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </motion.header>
  );
}
