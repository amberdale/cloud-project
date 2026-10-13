# amberdale.no

The Amberdale studio site: a hero with an interactive workspace that shows a
brand, a website and a SaaS tool being made. React, TypeScript, Tailwind CSS,
Framer Motion and Lucide. No backend, no API keys.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # type-checks, then writes dist/
../../scripts/deploy-app.sh amberdale web/amberdale/dist   # run from the repo root
```

## Structure

```
src/lib/
  useWorkspace.ts   active demo, run key and mode per demo (reducer)
  useTimeline.ts    one rAF clock per run; stops when the demo exits
  channel.tsx       progress (MotionValue) + step metadata for toolbar/status bar
  highlight.ts      small TS/JSX tokenizer for the code views
src/components/
  workspace/        window, tabs, status bar, CodeView, StepList
  demos/branding/   Mølle Bakeri brand board
  demos/websites/   code editor + Holm Arkitektur preview
  demos/saas/       Strøk quote calculator (quote.ts is the real pricing model,
                    shown in the editor via ?raw)
  site/             header, hero, services, method, contact
```

## Behaviour

- Tabs follow the WAI-ARIA pattern: arrow keys, Home and End.
- A finished demo shows its finished state when revisited; an interrupted one
  plays again from the start. Skip and Replay sit in the toolbar.
- The Strøk calculator keeps its values across tab switches and replays.
- `prefers-reduced-motion` shows every demo finished, with no typing.

## Brand notes

Colours and type follow the Amberdale brand guide (Edition 2). Romano Revival
is not on Google Fonts, so the wordmark falls back to Bodoni Moda; add the
licensed font with an `@font-face` named "Romano Revival" and it takes over.
The leaf in `components/brand/Leaf.tsx` is a redraw: swap in the master SVG.
