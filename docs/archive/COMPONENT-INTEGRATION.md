# Component integration pass

## Implemented
- Preserved current Club layout and all backend/data contracts.
- Hero 40 downloaded via official OriginKit CLI 0.2.25 into sibling component-review directory (not shipped). Inspected app/page.tsx, package and component code. Adapted its two-tone heading/foreground hierarchy to the existing FANTA007 cover, without agency content, external pictures, WebGL, server or database infrastructure.
- AppearText and RadialAction are ORIGINAL local implementations inspired by the requested patterns, not copies of unavailable OriginKit component source. Motion was already installed.
- FAQ3 adapted from user attachment using Radix Accordion and existing CSS. Eight attachments were byte-identical copies of FAQ3. No stock avatars or demo content imported.
- TeamSelector now uses Radix Select, existing TeamCrest assets, name, keyboard typeahead, focus return and portal positioning.
- AgentReaction in acquisition and dossier analysis uses existing optimized character images. Scoring untouched. Levels 1/2/3/4/5 map to critical/warning/thinking/positive/positive.
- Mobile filters no longer remain sticky over player rows.
- Welcome code loaded separately; Agentation remains development-only.

## Dependencies
Added @radix-ui/react-select and @radix-ui/react-accordion. No Tailwind, GSAP, second motion library, OGL or Three.js added. Lockfile updated.

## Considered, not shipped
- InteractiveListPreview attachment: GSAP pointer-follow imagery and desktop inversion obscure a dense list; no player-row hover overlay. Preserve clear click-to-open dossiers and actual crests.
- OriginKit Hover Image Reveal, Morphing Glyph Cloud, Ascii Flame Ball, Neon Border, Dither Reveal, Click Effects and Particle Enfold: reviewed CLI dependency manifest and suitability; source retrieval limited by service quota. No claim of full source review for these. Decorative effects reserved rather than stacked on the operational UI.
- OriginKit dry-run consumed component-fetch quota; server reported daily limit. No automatic retry or bypass. API key used only as process environment and removed afterward; not in project source, documentation or dist.
- 21st text catalogue explored: Vertical Cut Reveal is a relevant alternative to the current word reveal, not an additional concurrent effect. Blur Text Effect adds GSAP and duplicates the existing motion stack; Word Loader adds an unnecessary cycling loading message. No code imported from these references.

## Assets still needed for exact reaction brief
Existing image variants are retained, not regenerated. Elite currently shares positive, and medium uses thinking rather than a nonexistent thumbs-up. For five distinct expressions supply transparent original-character PNGs under frontend/src/assets/agent/reactions/:
- elite.png: clearly amazed/impressed, same character and costume.
- medium.png: restrained approval/thumbs-up.
- low.png: disapproval/thumbs-down if the existing warning illustration is unsuitable.
Existing positive and critical serve high and very low until art direction is approved.

## Verification and remaining scope
- 30 frontend tests passed (4 new integration checks); TypeScript/Vite build passed.
- Build has a non-blocking 500kB chunk warning (~508kB uncompressed, ~160kB gzip main JS); do not call this performance fully optimized.
- Browser tested FAQ open, landing desktop/mobile, Roma selection using keyboard typeahead, combined Roma + attacker filter, real Malen reaction (4.9/5), acquisition at 20 credits.
- Fixed word spacing regression found in screenshots and mobile sticky-filter overlap found in interaction testing.
- Backend, data, existing assets: zero hash differences from recovered baseline.
- No new secret matches in frontend/src, frontend/dist or docs. No commit/push/deploy.
- Not exhaustive: all devices, all five reaction renderings in browser, screen-reader audit. Tests cover all five mappings.
- Previous known issue remains: unsaved purchase price resets on dossier round trip. Outside this component selection pass.

## Sources
- https://www.originkit.dev/ (official CLI homepage/package verified)
- https://21st.dev/community/components/s/text
- https://21st.dev/@danielpetho/components/vertical-cut-reveal
- https://21st.dev/community/components/user/blur-text-effect
- https://21st.dev/@chetanverma16/components/word-loader
- https://www.radix-ui.com/primitives/docs/components/select
- https://www.radix-ui.com/primitives/docs/components/accordion

Local preview: http://127.0.0.1:5173/ while local frontend/backend processes run. Private window for a clean squad. Production unchanged.
