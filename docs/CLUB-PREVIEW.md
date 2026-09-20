# FANTA007 — Club frontend preview

## Scope
New welcome composition and Home matchroom, horizontal desktop navigation,
mobile bottom navigation, light surfaces with petrol/gold brand contrast.
Existing agents, team crests, purchase rules, API, datasets and persistence retained.
This is a first interactive design preview, not a production release.

## Tool roster and actual use
- https://transitions.dev/: sliding active-tab indicator and restrained section/panel arrival patterns. Independently authored implementation; no skill installation or premium source imported.
- https://21st.dev/: navigation/component discovery reference. No registry component copied or installed; no claim of MCP integration.
- Motion 13.2.0: runtime animation dependency, reduced-motion aware.
- Agentation 3.0.2: development-only dynamically imported feedback UI on desktop >=900px; no endpoint/webhook configured. Copy annotations into Codex. Not in production output.
- OriginKit, Aceternity, Beautiful UI: reserve. Component Gallery: established pattern reference.
- Impeccable: reserve at user's explicit request; not the design authority for this pass.
Future new tools/components/dependencies require explanation and user approval.

## Verification
- TypeScript/Vite production build passes.
- Frontend tests: 26 passed.
- Backend tests: 134 passed, 4 skipped for missing original Excel exports, 2 deprecation warnings.
- Backend and data hashes match recovered export manifest.
- Browser: new Classic league (8 participants, 500 credits), player list loads, Malen purchase at 20 credits, provisional evaluation shows one attacker.
- Mobile 390px: Home, dossier and provisional evaluation scroll width equals viewport width.
- Dossier renders existing 2026/27 and 2025/26 statistics; zero assists remains zero.
- Browser errors command returned no errors during dossier check.
- Desktop welcome/Home and mobile Home/dossier screenshots inspected.

## Preview and limitations
Frontend: http://127.0.0.1:5173/; existing backend: http://127.0.0.1:8000.
Servers must remain running. Localhost is available on this computer only.
Use a private browser window for a fresh squad without clearing the user's stored squad.
No commit, push or Vercel deployment performed. Recovered source has no .git;
reconcile into a versioned branch before publication. Original export remains intact.
Not yet exhaustive: tablet matrix, complete-roster visual evaluation, keyboard/screen-reader audit,
all combined-filter combinations. Existing purchase preview loses unsaved price when opening
the dossier and returning; price must currently be entered again. This needs a targeted UX follow-up.
