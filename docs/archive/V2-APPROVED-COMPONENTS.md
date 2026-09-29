# V2 — approved components and verified handoff

Status updated: 2026-09-20. This manifest supersedes older candidate selections,
not historical audit findings.

All six approved UI slots are integrated. Five have exact retrieved or
user-supplied source provenance. S1 preserves the selected public visual and
interaction contract, but its exact 21st.dev code bundle could not be diffed
because the component-code retrieval quota was exhausted.

## Approved scope

| Slot | Exact model | Status |
| --- | --- | --- |
| N1 main navigation | [Floating Dock — manuarora700](https://21st.dev/@manuarora700/components/floating-dock) | Integrated; desktop/mobile behavior verified |
| Dossier navigation | [Expandable Tabs — victorwelander](https://21st.dev/@victorwelander/components/expandable-tabs) | Integrated from the exact user-supplied source; panel state and keyboard behavior retained |
| D2 dossier Scheda | [Stats Card — ravikatiyar162](https://21st.dev/@ravikatiyar162/components/stats-card-1) | Integrated from the retrieved source hierarchy; responsive desktop/mobile grid verified |
| S1 dossier statistics | [Bar Chart — bklitai](https://21st.dev/@bklitai/components/bar-chart), interactive demo 10116 | Integrated as a public-source product port; visual, 1100 ms motion, pointer and keyboard interaction verified |
| H1 hero | [Hero Section — reuno-ui](https://21st.dev/@reuno-ui/components/hero-section) | Integrated from retrieved source; progressive animation and responsive layout verified |
| Features | [Bento Features — larsen66](https://21st.dev/@larsen66/components/bento-features) | Integrated from retrieved source; golden-angle spiral, randomization and responsive card spans verified |

Keep the existing budget graphic. Expandable Tabs replaces dossier navigation,
not the budget graphic. The four panels remain Scheda, Statistiche, Analisi and
Consiglio. Clicking outside may collapse labels but does not clear the selected
panel. Efferd Modal is excluded.

## Provenance

- N1 original public source: https://ui.aceternity.com/components/floating-dock
  - archive: `docs/vendor/aceternity-floating-dock.original.tsx`
  - port: `frontend/src/components/ui/FloatingDock.tsx`
- Expandable Tabs user source:
  - archive: `docs/vendor/21st-expandable-tabs.user-source.tsx`
  - port: `frontend/src/components/ui/ExpandableTabs.tsx`
- H1 retrieved source:
  - archive: `docs/vendor/21st-reuno-hero.original.tsx`
  - port: `frontend/src/components/ui/ReunoHero.tsx`
- D2 retrieved source:
  - archives: `docs/vendor/21st-stats-card-1.original.tsx` and
    `docs/vendor/21st-stats-card-1.demo.tsx`
  - port: `frontend/src/components/ui/StatsCard.tsx`
- Bento retrieved source:
  - archives: `docs/vendor/21st-bento-features.original.tsx` and
    `docs/vendor/21st-bento-features.demo.tsx`
  - port: `frontend/src/components/ui/BentoFeatures.tsx`
- S1 public sources:
  - 21st.dev selection: https://21st.dev/@bklitai/components/bar-chart
  - official docs: https://bklit.com/docs/components/bar-chart
  - author repository: https://github.com/bklit/bklit-ui
  - record: `docs/vendor/bklit-bar-chart-interactive.public-reference.md`
  - port: `frontend/src/components/ui/InteractiveBarChart.tsx`

## Product adaptations

- Tailwind utilities were translated to locally scoped CSS because FANTA007 is
  a plain-CSS Vite application.
- Italian product copy, real Listone fields and existing navigation callbacks
  replace demo placeholders.
- Accessible names, focus states, keyboard navigation and reduced-motion
  behavior were retained or added without altering the underlying saved data.
- The Stats Card hierarchy remains card/header/title/icon/content. The dossier
  maps it to QI, QA, FVM / 1000 and league-normalized FVM.
- The bar chart reads only verified season metrics and never invents missing
  data. Its full-height hit areas keep short/zero-value bars keyboard accessible.
- The Bento keeps the original six-column desktop composition, responsive
  collapse, 800-point golden-angle spiral, R-key randomization and hover outline.
- The H1 keeps the deliberate progressive word reveal. Screenshots should be
  taken after the entrance motion has settled.

## Verification

- Browser desktop: H1, Bento, N1, Listone, D2 cards, Expandable Tabs and S1 chart
  were inspected against live API data.
- Browser mobile at 390 x 844: Bento collapses to one column; D2 cards stack;
  dossier tabs remain usable; S1 fits a 330 px content width without horizontal
  overflow.
- S1 hover/click inspection shows the active value tooltip and dims inactive
  bars. Bar heights were measured after animation.
- Saved squad remained intact during checks: 25/25 players, 438 spent and 62
  available. No purchase, reset, migration or scoring change was performed.
- `/presentazione` remains independent of API hydration. The full application
  uses the API and Vite proxy.
- No deployment, commit or push was performed by this completion pass.

## Local preview

From the repository root, run:

```powershell
.\scripts\windows\Start-Preview.ps1 -OpenBrowser
```

The launcher starts or reuses the backend on port 8000 and Vite on port 5173,
then verifies API health, HTML and real Listone data before opening the browser.

- App: http://127.0.0.1:5173/
- H1 + Bento: http://127.0.0.1:5173/presentazione
- Listone + dossier: http://127.0.0.1:5173/players
- API health: http://127.0.0.1:8000/api/v1/health

## Remaining acceptance caveat

The selected S1 source bundle should be retrieved after the 21st.dev quota
resets and diffed against the local port. Until then, S1 is verified against the
exact selected preview and the author's official public documentation/API, but
is not represented as a verbatim copy of the locked demo source.
