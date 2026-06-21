# Project Goal

## North Star

Make CSS Grid Lanes masonry practical for real production websites today through a native-first Web Component that follows the platform when support exists and provides a small, spec-shaped fallback for unsupported browsers, without presenting itself as a masonry Grid Lanes polyfill.

## Who This Is For

This project is for web developers who want to use CSS Grid Lanes-style masonry layouts in production today while keeping their markup, styling, and future migration path close to the native platform.

## Core Goals

1. Provide a production-ready light-DOM custom element.
   `<masonry-grid-lanes>` should be easy to register, style, and use with ordinary HTML and CSS. It should preserve author control over content, typography, and card design.

2. Prefer the native platform whenever possible.
   When `display: grid-lanes` is supported, the component should get out of the browser's way and let native layout decide placement.

3. Offer a spec-shaped JavaScript fallback for unsupported browsers.
   The fallback should preserve the supported Grid Lanes mental model: columns and rows, gaps, minimum track sizing, explicit row counts, order, flow tolerance, and simple grid-axis placement and spanning.

4. Keep performance a first-class concern.
   Rich or mixed cards can use DOM measurement, while plain text collections can opt into Pretext-based height estimation. The headless API should support large text-card datasets and custom renderers without forcing all cards into the DOM.

5. Use demos as living documentation and behavioral checks.
   The image, text, social-card, mixed-content, row-lane, reference-switch, and playground demos should show realistic authoring patterns and act as targets for Playwright integration tests.

6. Make removal straightforward once native support is broad enough.
   An engineer or AI agent should be able to remove the library from a project in minutes, not hours, without changing the product's layout intent or user-facing presentation.

7. Keep the package small, focused, and framework-independent.
   The library should remain usable from plain JavaScript and composable inside other frameworks without becoming tied to any one app stack.

## Success Looks Like

- Developers can install the package, register the component, add default styles, and get useful masonry behavior with minimal setup.
- Production sites can rely on the component for supported column masonry, text-heavy layouts, and carefully authored row-lane layouts.
- Native Grid Lanes support improves automatically without requiring authors to migrate away from the component, and eventual removal remains simple when browser support is sufficient.
- Fallback behavior is covered by focused unit tests and Playwright integration tests that exercise the demo pages.
- The README and demos clearly explain where the fallback is strong, where row mode is experimental, and where full CSS Grid parity is out of scope.
- Performance-sensitive text layouts can reduce repeated DOM layout reads by using Pretext metrics or the headless API.

## Non-Goals

- This project is not a masonry Grid Lanes polyfill.
- The fallback does not aim to support every `grid-template-*` form, every CSS Grid placement grammar edge case, or complete parity with native masonry Grid Lanes implementations.
- The component should not become a framework-specific package, design system, feed renderer, or virtual scrolling library.
- The demos should not define a required visual style for users; they exist to document and validate usage patterns.
- Row mode should not pretend to solve every horizontal masonry case without author constraints. In current fallback behavior, row-lane layouts need deliberate sizing and scrolling patterns.
- The package should not install or duplicate tools already provided by Vite+ in this repository.

## Principles and Constraints

- Native first: browser support is the preferred path, not an implementation detail to hide.
- Progressive enhancement: unsupported browsers should get a useful supported subset instead of an unrelated layout model.
- Easy exit: authoring patterns should stay close enough to native Grid Lanes that future removal is a small migration.
- Light DOM by default: authors should be able to style children with ordinary selectors and keep semantic markup intact.
- Clear scope over magical compatibility: document fallback guarantees honestly, especially while CSS Grid Lanes continues to evolve.
- Measured performance work: use DOM measurement where needed, Pretext where appropriate, and pure layout math where possible.
- Test public behavior: prioritize tests around exported layout helpers, custom-element fallback behavior, Pretext measurement, and demo workflows.
- Use Vite+ for repository tasks: dependency management, checks, tests, and builds should go through `vp`.

## Current Focus

- Maintain the `0.1.x` foundation as a production-ready package with honest scope boundaries.
- Strengthen column masonry and text-heavy layout confidence.
- Improve row support while keeping it well documented and honest about its current constraints.
- Preserve the demos as both examples and regression coverage for real-world usage.
