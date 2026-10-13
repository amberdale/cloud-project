import type { ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'onLoden';

const styles: Record<Variant, string> = {
  primary: 'bg-loden text-bone hover:bg-loden-deep active:bg-loden-deep',
  secondary: 'border border-ribbon text-ribbon hover:bg-sage active:bg-sage',
  onLoden: 'bg-bone text-ribbon hover:bg-sage active:bg-sage',
};

/** The guide's buttons: Loden fields with tracked mono labels, square corners. */
export function ButtonLink({ href, variant = 'primary', children, className = '' }: { href: string; variant?: Variant; children: ReactNode; className?: string }) {
  return (
    <a
      href={href}
      className={`group inline-flex h-12 items-center gap-3 px-5 font-mono text-[12px] uppercase tracking-[0.14em] transition-[background-color,transform] duration-200 active:scale-[0.985] ${styles[variant]} ${className}`}
    >
      {children}
    </a>
  );
}
