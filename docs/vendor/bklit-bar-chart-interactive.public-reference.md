# Bklit Bar Chart Interactive — public reference

This file records the public sources used for the FANTA007 S1 product port. It is
not a claim that the locked 21st.dev source bundle was copied verbatim.

- Selected 21st.dev component: https://21st.dev/@bklitai/components/bar-chart
- Selected demo id: `10116`
- Selected demo slug: `bar-chart-interactive`
- Public preview: https://cdn.21st.dev/bklitai/bar-chart/bar-chart-interactive/preview.1785311329972-b058687e-c765-43f3-9e84-57c20691fb75.png
- Official documentation: https://bklit.com/docs/components/bar-chart
- Author repository: https://github.com/bklit/bklit-ui
- Repository license: MIT for the public `packages/ui` source; no Bklit Studio
  proprietary source was copied.

## Verified interaction contract

- Minimal, unframed vertical bars on a light background.
- Sparse categorical labels and tight gaps.
- Direct hover and keyboard-focus inspection.
- Active bar emphasis with the remaining bars dimmed.
- Tooltip anchored above the active bar.
- 1100 ms default bar-growth motion, matching the official public API.
- Public composition model: `BarChart`, `Grid`, `Bar`, `BarXAxis`,
  `ChartTooltip`.

The application implementation lives in
`frontend/src/components/ui/InteractiveBarChart.tsx`. Its copy and data mapping
are FANTA007-specific, while the verified visual and interaction contract above
is preserved.
