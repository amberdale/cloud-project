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
  demos/photo.tsx   paper textures for the print mockups (SVG filters)
public/images/      demo photography, see Photo credits below
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

## Photo credits

Demo photos come from Unsplash (Unsplash License: free for commercial use, no
attribution required). They are stored locally, so the site loads nothing
from Unsplash. Source pages, by photo id:

| File | Unsplash id |
| --- | --- |
| `rye-loaves.webp` | `photo-1509440159596-0249088772ff` |
| `fjord.webp` | `photo-1601439678777-b2b3c56fa627` |
| `hus-tveit.webp` | `photo-1600566753190-17f0baa2a6c3` |
| `sjobu.webp` | `photo-1527004013197-933c4bb611b3` |
| `skarvet.webp` | `photo-1518780664697-55e3ad937233` |

The Holm captions are fictional: the boathouse photo is from Lofoten, not
Austevoll.
