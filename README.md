# @schalkneethling/masonry-gridlanes-wc

`@schalkneethling/masonry-gridlanes-wc` is a native-first masonry library for the modern web. It wraps the emerging CSS Grid Lanes model in a light-DOM custom element, falls back to a spec-shaped JavaScript placement engine where `display: grid-lanes` is not available yet, and includes [Pretext-powered](https://github.com/chenglou/pretext) helpers for large text-card datasets.

## Why this library

- Native first: when the browser supports `display: grid-lanes`, the component gets out of the way and hands layout to the browser.
- Spec-aligned fallback: when native support is missing, the fallback keeps the same mental model as Grid Lanes instead of falling back to an unrelated layout system.
- Performance-aware: rich cards can use DOM measurement, while text-only collections can opt into [Pretext](https://github.com/chenglou/pretext) to avoid repeated layout reads on resize.

## Install

```bash
vp add @schalkneethling/masonry-gridlanes-wc
```

```bash
npm install @schalkneethling/masonry-gridlanes-wc
```

```bash
pnpm add @schalkneethling/masonry-gridlanes-wc
```

## Basic usage

```js
import {
  adoptMasonryGridLanesStyles,
  defineMasonryGridLanes,
} from "@schalkneethling/masonry-gridlanes-wc";

defineMasonryGridLanes();
await adoptMasonryGridLanesStyles(document);
```

```html
<masonry-grid-lanes min-column-width="240" gap="16">
  <article>One</article>
  <article>Two</article>
  <article>Three</article>
</masonry-grid-lanes>
```

## Row mode (experimental)

Row mode is supported through `mode="rows"`, `min-row-height`, and, for the clearest
`0.1.0` behavior, an explicit `row-count`:

```html
<masonry-grid-lanes mode="rows" row-count="3" min-row-height="176" gap="18">
  <article class="row-card">Compact summary</article>
  <article class="row-card row-card--media">Media + copy</article>
</masonry-grid-lanes>
```

The important mental model is different from column masonry:

- column mode packs downward and usually grows vertically
- row mode packs sideways and usually grows horizontally
- the host should be the scroll surface in row mode
- `row-count` is the recommended way to make row lanes deterministic in `0.1.0`
- cards should have intentional inline-size limits so they stay readable and predictable

Recommended authoring pattern for row mode:

```css
masonry-grid-lanes[mode="rows"] {
  min-block-size: 32rem;
  overflow-x: auto;
}

.row-card {
  width: min(22rem, 78vw);
}

.row-card img {
  display: block;
  width: 100%;
  height: 8.5rem;
  object-fit: cover;
}
```

Without width constraints, rich cards can become much wider than expected in row mode because the
layout is preserving each item's inline size while packing across lanes.

## Fallback guarantees

When native Grid Lanes is unavailable, the component fallback preserves these inputs:

- `gap`
- `min-column-width`
- `min-row-height`
- `row-count`
- `mode="columns|rows"`
- `flow-tolerance`
- child `order`
- grid-axis placement and spanning via `grid-column-*` in column mode
- grid-axis placement and spanning via `grid-row-*` in row mode

The fallback is intentionally aligned to the current Grid Lanes direction of CSS Grid Level 3, not the older `grid-template-rows: masonry` proposal.

For row mode specifically, the fallback now:

- keeps the host contained inside its parent instead of expanding the whole page width
- exposes horizontal overflow on the host when packed content is wider than the viewport
- honors explicit `row-count` when you want fixed rows instead of height-derived auto rows
- respects explicit item widths
- clamps unconstrained item measurement to a sane inline-size ceiling based on the host width

## Release stance

This first public release is intended for real projects, with a clear scope.

- strongest today: column masonry, spec-aligned fallback behavior, and text-heavy layouts using Pretext
- experimental but promising: row mode, especially when authors treat the host as the scroll surface and give cards intentional inline-size limits
- forward-looking by design: native `display: grid-lanes` support is still emerging, so this library is intentionally built around a platform feature that will continue to evolve

The goal of `0.1.0` is not to claim that every masonry use case is solved forever. It is to provide a practical, well-tested, native-first foundation that developers can use now while the specification and the platform evolves.

## Pretext usage

For plain-text cards, add `text-metrics="pretext"` to the host:

```html
<masonry-grid-lanes min-column-width="280" gap="16" text-metrics="pretext">
  <article>Text-only card</article>
  <article>Another text-only card</article>
</masonry-grid-lanes>
```

This path is best when:

- every card is plain text
- card typography and chrome are shared
- resize cost matters more than first-layout cost

For mixed or rich markup cards, the library stays on DOM measurement.

Optional shared metric overrides are available as CSS custom properties:

```css
masonry-grid-lanes[text-metrics="pretext"] {
  --mgl-pretext-font: 16px "Spectral", serif;
  --mgl-pretext-line-height: 24px;
  --mgl-pretext-inline-chrome: 26px;
  --mgl-pretext-block-chrome: 22px;
}
```

## Headless API

The `/headless` export is for large text-card datasets where you want Pretext layout math without mounting every card:

```js
import {
  layoutPretextMasonry,
  sampleTextMetricsFromElement,
} from "@schalkneethling/masonry-gridlanes-wc/headless";
```

Use it for:

- virtualized feeds
- large text walls
- custom renderers that want to own DOM lifecycle

## Development

This repository uses Vite+ internally, so the `vp` commands below are the preferred local workflow here.

```bash
vp install
vp check src tests e2e demos playwright.config.ts vite.config.ts package.json tsconfig.json
vp test
vp run demo
vp run build:demo
```

Equivalent package-manager commands:

```bash
npm install
npm test
npm run check
npm run demo
```

```bash
pnpm install
pnpm test
pnpm run check
pnpm run demo
```

## Demo deployment

The demos are built as a separate multi-page site for static hosting.

- local preview: `vp run demo`
- production demo build: `vp run build:demo`
- Netlify publish directory: `dist-demo`

The Netlify config redirects `/` to `/demos/index.html` so the deployed site lands on the demo hub.

## Release workflow

GitHub Actions handles CI and releases:

- pull requests run checks, unit tests, and Playwright e2e coverage
- `release-please` maintains the changelog, opens the release PR from commits merged into `main`, and publishes to npm when a release is cut

Using Conventional Commits for merge commits will make the generated changelog and version bumps much more useful.

## Demos

- Image masonry
- Text-only Pretext masonry
- Social cards
- Mixed media + text wall
- Row lanes with constrained cards
- Column/row reference switcher
- Interactive playground
