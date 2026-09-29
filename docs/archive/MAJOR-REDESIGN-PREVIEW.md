# FANTA007 — major frontend redesign preview

Updated 2026-09-10. Preview scope, not production approval.

## Direction and preserved product

Warm light canvas, petrol navigation and character stage, gold actions. Open editorial welcome composition, desktop club rail and mobile bottom navigation. Existing PNG source assets/optimized derivatives and team crests are preserved. Home, squad, Listone and evaluation remain the same product and routes. No backend, canonical data, scoring, API contracts or production deployment changes.

## Implemented across this pass and the preceding saved pass

- Hero: two-tone word reveal, foreground character entrance and restrained aperture linework. Existing AppearText/RadialAction remain original adaptations, not claims of copied OriginKit source.
- Home: explicit goal, real squad completion, budget/reserve, department actions and contextual agent advice.
- Operational surfaces: revised spacing and hierarchy, squad/master-detail styling, light dossier/statistics/purchase/settings presentation.
- Onboarding: visible five-step progress, clickable previous steps, validation still gates forward movement, focus moves to the new step. Goal enum values remain unchanged.
- Dossier: shared moving tab indicator, arrow keys/Home/End, one tab stop, reduced-motion support. Long appeal badge wraps on narrow phones.
- Purchase: unsaved per-player price survives opening and returning from the dossier. Drafts are not written to persisted squad data and clear after acquisition.
- Dialogs: focus trap no longer resets on callback identity changes; ignores hidden/non-tab-stop controls. Escape closes the dialog rather than navigating the underlying Listone to Home. Focus returns to the player button.
- Scroll clearance prevents fixed controls from covering focused content.

## Tooling evidence

UI UX Pro Max installed and used: `focus not obscured --domain ux` and `keyboard focus modal --stack react`. Applicable results informed scroll padding, focus return, keyboard navigation and dialog callback stability. No generic palette output replaced the user-selected identity.

21st MCP was accessed via its authenticated HTTP endpoint because it is not exposed as a native callable tool in this session. Free catalog search returned:
- https://21st.dev/@originui/components/stepper
- https://21st.dev/@sean0205/components/stepper
- https://21st.dev/@ibelick/components/animated-tabs
- https://21st.dev/@preetsuthar17/components/animated-tabs

Only metadata was retrieved. No paid source retrieval, imported 21st source, extra dependency or claim of full animation/source inspection. The implemented controlled-stepper and shared-tab-selection patterns are local code using existing React/Motion. OriginKit Hero40 had been downloaded and inspected in the earlier integration pass; see COMPONENT-INTEGRATION.md for provenance and quota limitations. Impeccable remains fallback, not the governing direction.

## Verified

- TypeScript/Vite production build passes; 31 frontend tests pass.
- Fresh onboarding at 375px: name, next step, focus announcement, return to completed step, creation through existing API.
- Dossier at 375px: keyboard arrow selects Statistics and focuses its tab; actual Malen current and historical goals/assists render.
- Escape: zero open dialogs, route remains `/players`, focus returns to `Apri Donyell Malen`.
- No document horizontal overflow at 375px for tested onboarding/dossier, or 1440px Home.
- Previous saved pass: purchase at 20 credits after dossier round-trip; persisted ID and price verified.
- 102 protected baseline files in backend/data/assets/public compared by SHA256: zero differences.

## Not yet certified

- Whole-product accessibility, every viewport/zoom level, browser matrix and complete-roster end-to-end regression are not exhaustively verified.
- Main JS bundle remains about 510kB minified; Vite warning is non-blocking. Layered legacy CSS remains technical debt.
- Five distinct agent facial reactions are not available; existing positive art serves both high and elite. No new image assets generated.
- Test harness prints a development WebSocket port warning despite all assertions passing.
- Working copy has no .git directory. No commit, push or deploy performed.

## Testing

### FAQ / footer integration and recovery — 2026-09-11

- Selected user-supplied FAQ3 (Radix accordion), six product-specific questions; no duplicate FAQ.
- Footer contains only working configuration/resume action and in-page FAQ/top links. Third-party promotional logo strip not added: permission has not been established.
- Preserved existing Hero40 adaptation, navigation, stepper and other working integrations; no new dependency introduced in this pass.
- Dossier uses an additional decorative, blurred TeamCrest(player.team) layer. Fixed legacy selector specificity that hid its background; no new player images or datasets.
- Browser checks: FAQ single-open behavior with ArrowDown/Enter; footer opens onboarding; 375px and 1440px FAQ document widths match viewport; fresh onboarding reaches Home and API-backed Listone; Statistics tab opens; Escape returns focus to the player and keeps /players.
- Frontend: 31 tests pass; production build passes. Existing WebSocket test-port and >500kB chunk warnings remain.
- Services restarted after app restart: frontend 5173, backend 8000. This is a local preview, not a production deployment.
- Overall component roster remains PARTIAL: exact Particle Interlock source integration, previous/next Listone pagination and any additional slider placement are not delivered by this pass. No claim that all supplied references have been implemented.

http://127.0.0.1:5173/ on this PC while local services run. Private window for a fresh team without touching existing browser storage. API on port 8000. Localhost is not reachable from a separate phone; use a later approved preview deployment or scoped LAN setup for device testing.
