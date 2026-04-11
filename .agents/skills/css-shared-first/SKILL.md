---
name: css-shared-first
description: >
  Apply the Shared First CSS methodology when writing responsive styles.
  Use this skill whenever writing or reviewing CSS that involves media queries,
  responsive layouts, viewport-specific overrides, or breakpoint-driven design.
  Trigger when the user asks to write responsive CSS, refactor mobile-first CSS,
  or when any component or layout has viewport-specific styles. This skill
  replaces mobile-first pattern guidance — always prefer Shared First unless
  the user explicitly requests mobile-first.
---

# CSS Shared First

## Core Philosophy

**Shared First** is a CSS authoring methodology that eliminates cascade bleed
between breakpoints. The rule is simple:

> Only write CSS outside of media queries if it applies to **all** viewport
> sizes. Everything else belongs inside a **bounded** media query that targets
> exactly the viewport range it is meant for.

This is in contrast to the traditional **Mobile First** approach, which writes
base styles for small viewports and progressively overrides them for larger
ones — a pattern that is error-prone and produces noisy DevTools output full of
struck-through declarations.

## The Two Downsides of Mobile First

1. **Error prone — styles bleed upward.** Any CSS written outside a media query
   or inside an open-ended `min-width` query will affect all larger viewports
   too. Forgetting to undo a change for larger sizes introduces regressions.

2. **Hard to inspect.** DevTools shows a cascade of overridden (struck-through)
   properties, making it difficult to understand what is actually in effect at
   any given viewport.

## The Shared First Rules

### Rule 1 — Shared styles go outside all media queries

Only styles that are literally identical across every breakpoint live at the
top level. If a property value changes at any breakpoint, it does not belong
outside a media query.

```css
/* Correct — flex layout is shared across all sizes */
.card-grid {
  display: flex;
  flex-wrap: wrap;
}

/* Wrong — gap differs per breakpoint, so this bleeds */
.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem; /* ← this does NOT belong here if it changes */
}
```

### Rule 2 — Use bounded media queries for viewport-specific styles

Every media query that is not an open-ended upper-bound query must target
exactly one range. Use the **CSS Media Queries Level 4 range syntax** with
comparison operators (`<`, `<=`, `>`, `>=`). It reads naturally, is more
concise than `min-width`/`max-width`, and — crucially — `<` is exclusive so
boundaries never overlap. No more `−0.03125em` offset hacks.

```css
/* small only */
@media (width < 40em) { … }

/* medium only — bounded on both sides in a single expression */
@media (40em <= width < 60em) { … }

/* large and up — open-ended upper bound is fine for the largest tier */
@media (width >= 60em) { … }
```

Range syntax is Baseline 2023 — supported in all modern browsers (Chrome 113+,
Firefox 63+, Safari 16.4+).

### Rule 3 — Repeat, don't inherit

Define each viewport-specific value explicitly in its own media query rather
than relying on cascade inheritance from a smaller breakpoint. Redundancy here
is intentional and is a maintenance feature, not a bug.

```css
/* small */
@media (width < 40em) {
  .card-grid {
    gap: 1rem;
  }
}

/* medium */
@media (40em <= width < 60em) {
  .card-grid {
    gap: 2rem;
  }
}

/* large */
@media (width >= 60em) {
  .card-grid {
    gap: 3rem;
  }
}
```

## Full Layout Example

HTML:

```html
<body>
  <main></main>
  <aside></aside>
</body>
```

### Mobile First (avoid)

```css
body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (width >= 40em) {
  body {
    gap: 2rem;
  }
}

@media (width >= 60em) {
  body {
    flex-direction: row; /* ← undoing column */
    gap: 3rem; /* ← overriding again */
  }
  main {
    flex: 3;
  }
  aside {
    flex: 1;
  }
}
```

### Shared First (prefer)

```css
/* Shared — flex is the same at every size */
body {
  display: flex;
}

/* small + medium — column layout */
@media (width < 60em) {
  body {
    flex-direction: column;
  }
}

/* small */
@media (width < 40em) {
  body {
    gap: 1rem;
  }
}

/* medium */
@media (40em <= width < 60em) {
  body {
    gap: 2rem;
  }
}

/* large */
@media (width >= 60em) {
  body {
    gap: 3rem;
  }
  main {
    flex: 3;
  }
  aside {
    flex: 1;
  }
}
```

No overrides. No struck-through properties. Each breakpoint is self-contained
and safe to modify independently.

## Refactoring Mobile First to Shared First

When asked to refactor existing CSS:

1. **Audit shared properties.** Identify which properties have the same value
   at every breakpoint. These are the only candidates for top-level declarations.

2. **Map each breakpoint's unique values.** For every property that changes,
   collect the value needed at each size. Each value belongs in its own bounded
   media query.

3. **Replace open-ended queries.** Convert `@media (width >= X)` queries
   (other than the largest breakpoint) into bounded range queries:
   `@media (X <= width < Y)`.

4. **Remove cascade-dependent overrides.** If a mobile-first file only changed
   a property to undo a previous value, eliminate the original declaration
   instead of keeping the override.

## Applies to Container Queries Too

The same principle applies to `@container` queries. Only write container-level
styles outside a `@container` rule if they truly apply at every container size.
Use bounded size conditions otherwise:

```css
/* shared */
.card {
  display: grid;
}

/* narrow container */
@container (width < 30em) {
  .card {
    grid-template-columns: 1fr;
  }
}

/* wide container */
@container (width >= 30em) {
  .card {
    grid-template-columns: 2fr 1fr;
  }
}
```

## Quick Reference

| Scenario                     | Where it goes                               |
| ---------------------------- | ------------------------------------------- |
| Same value at all sizes      | Outside all queries (shared)                |
| Value unique to small only   | `@media (width < <sm-upper>)`               |
| Value unique to medium only  | `@media (<md-lower> <= width < <md-upper>)` |
| Value for large and up       | `@media (width >= <lg-lower>)`              |
| Shared across small + medium | `@media (width < <md-upper>)`               |
| Shared across medium + large | `@media (width >= <md-lower>)`              |

## Further Reading

- Michael Großklaus — [Mobile First versus Shared First CSS](https://www.mgrossklaus.de/notes/2023-02-18-mobile-first-versus-shared-first-css/)
- MDN — [Using media queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries)
- MDN — [Media query range syntax](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries#syntax_improvements_in_level_4)
- MDN — [CSS Container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries)
