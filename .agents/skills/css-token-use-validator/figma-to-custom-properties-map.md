# Figma-to-CSS Custom Properties Map

Reference document for AI agents translating between Figma design tokens and the CSS custom properties used in the component library at `apps/component-library/src/css/common/tokens/`.

## How to use this document

When implementing a Figma design in code, look up the Figma token name in the left column and use the corresponding CSS custom property from the right column. Never use raw hex values when a token exists.

**Token files location:** `apps/component-library/src/css/common/tokens/`

| File                 | Purpose                                                               |
| -------------------- | --------------------------------------------------------------------- |
| `colors-prim.css`    | Primitive color values (low-level, do not use directly in components) |
| `colors-surface.css` | Surface/background semantic color tokens                              |
| `colors-text.css`    | Text and icon semantic color tokens                                   |
| `colors-border.css`  | Border semantic color tokens                                          |
| `typography.css`     | Font family, size, weight, line-height, letter-spacing                |
| `sizes.css`          | Spacing scale and section spacing tokens                              |

---

## Token architecture

The token system has three layers. Always use the highest semantic layer available.

```
Primitives (prim-*)  -->  Semantic (shared-*, web-*)  -->  Component-level
     Do NOT use               USE THESE                   Created per component
     in components             in CSS                      when needed
```

- **Primitives** (`--prim-color-*`, `--size-*`) are raw values. They exist only to be referenced by semantic tokens.
- **Semantic tokens** (`--shared-color-*`, `--web-color-*`, `--shared-spacing-*`) carry meaning (e.g. "brand", "surface", "critical"). Use these in component CSS.
- **Typography tokens** (`--typo-*`) are used directly and are responsive by default.

---

## 1. Primitive Colors

These map Figma's `primitives.prim-color.*` to CSS. **Do not use directly in component styles** -- use the semantic tokens in sections 2-4 instead.

### Black + White

| Figma token             | CSS custom property       | Value                   |
| ----------------------- | ------------------------- | ----------------------- |
| `prim-color.white`      | `--prim-color-white`      | `#fff`                  |
| `prim-color.white-t010` | `--prim-color-white-t010` | `#ffffff1a` (10% alpha) |
| `prim-color.white-t025` | `--prim-color-white-t025` | `#ffffff40` (25% alpha) |
| `prim-color.white-t060` | `--prim-color-white-t060` | `#fff9` (60% alpha)     |
| `prim-color.white-t075` | `--prim-color-white-t075` | `#ffffffbf` (75% alpha) |
| `prim-color.black`      | `--prim-color-black`      | `#000`                  |
| `prim-color.black-t000` | `--prim-color-black-t000` | `#0000` (0% alpha)      |
| `prim-color.black-t005` | `--prim-color-black-t005` | `#0000000d` (5% alpha)  |
| `prim-color.black-t010` | `--prim-color-black-t010` | `#0000001a` (10% alpha) |
| `prim-color.black-t020` | `--prim-color-black-t020` | `#0003` (20% alpha)     |
| `prim-color.black-t025` | `--prim-color-black-t025` | `#00000040` (25% alpha) |
| `prim-color.black-t050` | `--prim-color-black-t050` | `#00000080` (50% alpha) |
| `prim-color.black-t060` | `--prim-color-black-t060` | `#0009` (60% alpha)     |
| `prim-color.black-t075` | `--prim-color-black-t075` | `#000000bf` (75% alpha) |

### Brand Primary (Orange scale)

| Figma token                            | CSS custom property                      | Value     |
| -------------------------------------- | ---------------------------------------- | --------- |
| `prim-color.brand-primary.050`         | `--prim-color-brand-primary-050`         | `#ffede6` |
| `prim-color.brand-primary.100`         | `--prim-color-brand-primary-100`         | `#ffccb8` |
| `prim-color.brand-primary.200`         | `--prim-color-brand-primary-200`         | `#ffad8c` |
| `prim-color.brand-primary.300`         | `--prim-color-brand-primary-300`         | `#fd9065` |
| `prim-color.brand-primary.400`         | `--prim-color-brand-primary-400`         | `#de764c` |
| `prim-color.brand-primary.500`         | `--prim-color-brand-primary-500`         | `#e46431` |
| `prim-color.brand-primary.600_default` | `--prim-color-brand-primary-600-default` | `#e65014` |
| `prim-color.brand-primary.700`         | `--prim-color-brand-primary-700`         | `#d3450d` |
| `prim-color.brand-primary.800`         | `--prim-color-brand-primary-800`         | `#a43a10` |
| `prim-color.brand-primary.900`         | `--prim-color-brand-primary-900`         | `#522210` |

### Brand Secondary + Blue scale

| Figma token                   | CSS custom property             | Value     |
| ----------------------------- | ------------------------------- | --------- |
| `prim-color.brand-secondary`  | `--prim-color-brand-secondary`  | `#00559b` |
| `prim-color.blue.050`         | `--prim-color-blue-050`         | `#f0f3f8` |
| `prim-color.blue.100`         | `--prim-color-blue-100`         | `#e0e7f2` |
| `prim-color.blue.200`         | `--prim-color-blue-200`         | `#a4c0db` |
| `prim-color.blue.300`         | `--prim-color-blue-300`         | `#6c9cc5` |
| `prim-color.blue.400`         | `--prim-color-blue-400`         | `#3779b1` |
| `prim-color.blue.500_default` | `--prim-color-blue-500-default` | `#00559b` |
| `prim-color.blue.600`         | `--prim-color-blue-600`         | `#00447c` |
| `prim-color.blue.700`         | `--prim-color-blue-700`         | `#00335d` |
| `prim-color.blue.800`         | `--prim-color-blue-800`         | `#052642` |
| `prim-color.blue.900`         | `--prim-color-blue-900`         | `#031728` |

### Neutral (Grey scale)

| Figma token                   | CSS custom property             | Value                   |
| ----------------------------- | ------------------------------- | ----------------------- |
| `prim-color.neutral.050`      | `--prim-color-neutral-050`      | `#f6f6f6`               |
| `prim-color.neutral.100`      | `--prim-color-neutral-100`      | `#e3e3e3`               |
| `prim-color.neutral.200`      | `--prim-color-neutral-200`      | `#d0d0d0`               |
| `prim-color.neutral.300`      | `--prim-color-neutral-300`      | `#bfbfbf`               |
| `prim-color.neutral.400`      | `--prim-color-neutral-400`      | `#a2a2a2`               |
| `prim-color.neutral.500`      | `--prim-color-neutral-500`      | `#737373`               |
| `prim-color.neutral.600`      | `--prim-color-neutral-600`      | `#545454`               |
| `prim-color.neutral.700`      | `--prim-color-neutral-700`      | `#404040`               |
| `prim-color.neutral.700-t045` | `--prim-color-neutral-700-t045` | `#40404073` (45% alpha) |
| `prim-color.neutral.700-t065` | `--prim-color-neutral-700-t065` | `#404040a6` (65% alpha) |
| `prim-color.neutral.700-t075` | `--prim-color-neutral-700-t075` | `#404040bf` (75% alpha) |
| `prim-color.neutral.700-t085` | `--prim-color-neutral-700-t085` | `#404040d9` (85% alpha) |
| `prim-color.neutral.800`      | `--prim-color-neutral-800`      | `#313131`               |
| `prim-color.neutral.900`      | `--prim-color-neutral-900`      | `#1a1a1a`               |

### Red scale (Critical/Error)

| Figma token                  | CSS custom property            | Value     |
| ---------------------------- | ------------------------------ | --------- |
| `prim-color.red.050`         | `--prim-color-red-050`         | `#fff5f5` |
| `prim-color.red.100`         | `--prim-color-red-100`         | `#f4d9d7` |
| `prim-color.red.200`         | `--prim-color-red-200`         | `#e8b6b3` |
| `prim-color.red.300`         | `--prim-color-red-300`         | `#e98f89` |
| `prim-color.red.400`         | `--prim-color-red-400`         | `#d27069` |
| `prim-color.red.500_default` | `--prim-color-red-500-default` | `#a6504a` |
| `prim-color.red.600`         | `--prim-color-red-600`         | `#a53a33` |
| `prim-color.red.700`         | `--prim-color-red-700`         | `#65211c` |
| `prim-color.red.800`         | `--prim-color-red-800`         | `#4d1a16` |
| `prim-color.red.900`         | `--prim-color-red-900`         | `#35110e` |

### Green scale (Success)

| Figma token                    | CSS custom property              | Value     |
| ------------------------------ | -------------------------------- | --------- |
| `prim-color.green.050`         | `--prim-color-green-050`         | `#e6ede6` |
| `prim-color.green.100`         | `--prim-color-green-100`         | `#cae9cb` |
| `prim-color.green.200`         | `--prim-color-green-200`         | `#a6dfa8` |
| `prim-color.green.300`         | `--prim-color-green-300`         | `#80ce82` |
| `prim-color.green.400`         | `--prim-color-green-400`         | `#4eaf52` |
| `prim-color.green.500_default` | `--prim-color-green-500-default` | `#008900` |
| `prim-color.green.600`         | `--prim-color-green-600`         | `#006f00` |
| `prim-color.green.700`         | `--prim-color-green-700`         | `#005300` |
| `prim-color.green.800`         | `--prim-color-green-800`         | `#094409` |
| `prim-color.green.900`         | `--prim-color-green-900`         | `#042904` |

### Orange scale (Warning)

| Figma token                     | CSS custom property               | Value     |
| ------------------------------- | --------------------------------- | --------- |
| `prim-color.orange.050`         | `--prim-color-orange-050`         | `#faf2e7` |
| `prim-color.orange.100`         | `--prim-color-orange-100`         | `#f8e1c4` |
| `prim-color.orange.200`         | `--prim-color-orange-200`         | `#f0bc81` |
| `prim-color.orange.300`         | `--prim-color-orange-300`         | `#e9974e` |
| `prim-color.orange.400`         | `--prim-color-orange-400`         | `#e37b2c` |
| `prim-color.orange.500_default` | `--prim-color-orange-500-default` | `#d56321` |
| `prim-color.orange.600`         | `--prim-color-orange-600`         | `#b04b1e` |
| `prim-color.orange.700`         | `--prim-color-orange-700`         | `#8d3d1f` |
| `prim-color.orange.800`         | `--prim-color-orange-800`         | `#622e1a` |
| `prim-color.orange.900`         | `--prim-color-orange-900`         | `#3d180d` |

### Design Colors (Named materials/textures)

| Figma token                              | CSS custom property                        | Value     |
| ---------------------------------------- | ------------------------------------------ | --------- |
| `prim-color.design.leinen`               | `--prim-color-design-leinen`               | `#d9d8ce` |
| `prim-color.design.leinen-light`         | `--prim-color-design-leinen-light`         | `#f4f3f0` |
| `prim-color.design.sandstein`            | `--prim-color-design-sandstein`            | `#d8cabd` |
| `prim-color.design.sandstein-light`      | `--prim-color-design-sandstein-light`      | `#efeae5` |
| `prim-color.design.estrich`              | `--prim-color-design-estrich`              | `#c8ccce` |
| `prim-color.design.estrich-light`        | `--prim-color-design-estrich-light`        | `#e8ebec` |
| `prim-color.design.jakobskraut`          | `--prim-color-design-jakobskraut`          | `#d7c268` |
| `prim-color.design.terrakotta`           | `--prim-color-design-terrakotta`           | `#b87c59` |
| `prim-color.design.terrakotta-darker-aa` | `--prim-color-design-terrakotta-darker-aa` | `#a46845` |
| `prim-color.design.schwarz-esche`        | `--prim-color-design-schwarz-esche`        | `#695c57` |
| `prim-color.design.latsche`              | `--prim-color-design-latsche`              | `#43695b` |
| `prim-color.design.schlern`              | `--prim-color-design-schlern`              | `#798596` |
| `prim-color.design.schlern-darker-aa`    | `--prim-color-design-schlern-darker-aa`    | `#6b7788` |

---

## 2. Surface Colors (backgrounds)

These map Figma's `themes.modes.Light.shared.color.surface.*` to CSS. **Use these in component styles.**

File: `colors-surface.css`

### Brand surfaces

| Figma token                                    | CSS custom property                              | Resolves to                              |
| ---------------------------------------------- | ------------------------------------------------ | ---------------------------------------- |
| `shared.color.surface.brand.primary-default`   | `--shared-color-surface-brand`                   | `--prim-color-brand-primary-600-default` |
| `shared.color.surface.brand.primary-hover`     | `--shared-color-surface-brand-hover`             | `--prim-color-brand-primary-700`         |
| `shared.color.surface.brand.primary-pressed`   | `--shared-color-surface-brand-pressed`           | `--prim-color-brand-primary-800`         |
| `shared.color.surface.brand.secondary-default` | `--shared-color-surface-brand-secondary`         | `--prim-color-brand-secondary`           |
| `shared.color.surface.brand.secondary-hover`   | `--shared-color-surface-brand-secondary-hover`   | `--prim-color-blue-600`                  |
| `shared.color.surface.brand.secondary-pressed` | `--shared-color-surface-brand-secondary-pressed` | `--prim-color-blue-700`                  |

### Primary surfaces

| Figma token                            | CSS custom property                      | Resolves to                |
| -------------------------------------- | ---------------------------------------- | -------------------------- |
| `shared.color.surface.primary.default` | `--shared-color-surface-primary`         | `--prim-color-white`       |
| `shared.color.surface.primary.hover`   | `--shared-color-surface-primary-hover`   | `--prim-color-neutral-100` |
| `shared.color.surface.primary.pressed` | `--shared-color-surface-primary-pressed` | `--prim-color-neutral-200` |

### Inverted surfaces

| Figma token                                   | CSS custom property                             | Resolves to                     |
| --------------------------------------------- | ----------------------------------------------- | ------------------------------- |
| `shared.color.surface.invert.default`         | `--shared-color-surface-invert`                 | `--prim-color-black`            |
| `shared.color.surface.invert.hover`           | `--shared-color-surface-invert-hover`           | `--prim-color-neutral-800`      |
| `shared.color.surface.invert.pressed`         | `--shared-color-surface-invert-pressed`         | `--prim-color-neutral-700`      |
| `shared.color.surface.invert.subtle-default`  | `--shared-color-surface-invert-subtle`          | `--prim-color-neutral-700-t065` |
| `shared.color.surface.invert.subtle-hover`    | `--shared-color-surface-invert-subtle-hover`    | `--prim-color-neutral-700-t075` |
| `shared.color.surface.invert.subtle-pressed`  | `--shared-color-surface-invert-subtle-pressed`  | `--prim-color-neutral-700-t085` |
| `shared.color.surface.invert.subtle-disabled` | `--shared-color-surface-invert-subtle-disabled` | `--prim-color-neutral-700-t045` |

### Subtle surfaces

| Figma token                           | CSS custom property                     | Resolves to               |
| ------------------------------------- | --------------------------------------- | ------------------------- |
| `shared.color.surface.subtle.default` | `--shared-color-surface-subtle`         | `--prim-color-black-t010` |
| `shared.color.surface.subtle.hover`   | `--shared-color-surface-subtle-hover`   | `--prim-color-black-t020` |
| `shared.color.surface.subtle.pressed` | `--shared-color-surface-subtle-pressed` | `--prim-color-black-t025` |
| `shared.color.surface.subtle.lighter` | `--shared-color-surface-subtle-lighter` | `--prim-color-black-t005` |
| `shared.color.surface.subtle.darker`  | `--shared-color-surface-subtle-darker`  | `--prim-color-black-t020` |

### Transparent surfaces

| Figma token                                | CSS custom property                          | Resolves to               |
| ------------------------------------------ | -------------------------------------------- | ------------------------- |
| `shared.color.surface.transparent.default` | `--shared-color-surface-transparent`         | `--prim-color-black-t000` |
| `shared.color.surface.transparent.hover`   | `--shared-color-surface-transparent-hover`   | `--prim-color-black-t010` |
| `shared.color.surface.transparent.pressed` | `--shared-color-surface-transparent-pressed` | `--prim-color-black-t020` |

### Disabled surfaces

| Figma token                               | CSS custom property                         | Resolves to                |
| ----------------------------------------- | ------------------------------------------- | -------------------------- |
| `shared.color.surface.disabled.primary`   | `--shared-color-surface-disabled`           | `--prim-color-neutral-300` |
| `shared.color.surface.disabled.secondary` | `--shared-color-surface-disabled-secondary` | `--prim-color-black-t005`  |

### Overlay surfaces

| Figma token                           | CSS custom property                     | Resolves to               |
| ------------------------------------- | --------------------------------------- | ------------------------- |
| `shared.color.surface.overlay.image`  | `--shared-color-surface-overlay-image`  | `--prim-color-black-t020` |
| `shared.color.surface.overlay.dialog` | `--shared-color-surface-overlay-dialog` | `--prim-color-black-t050` |

### Status surfaces

| Figma token                                   | CSS custom property                             | Resolves to                      |
| --------------------------------------------- | ----------------------------------------------- | -------------------------------- |
| `shared.color.surface.success.default`        | `--shared-color-surface-success`                | `--prim-color-green-500-default` |
| `shared.color.surface.success.hover`          | `--shared-color-surface-success-hover`          | `--prim-color-green-600`         |
| `shared.color.surface.success.pressed`        | `--shared-color-surface-success-pressed`        | `--prim-color-green-700`         |
| `shared.color.surface.success.light-default`  | `--shared-color-surface-success-light-default`  | `--prim-color-green-100`         |
| `shared.color.surface.success.light-hover`    | `--shared-color-surface-success-light-hover`    | `--prim-color-green-200`         |
| `shared.color.surface.success.light-pressed`  | `--shared-color-surface-success-light-pressed`  | `--prim-color-green-300`         |
| `shared.color.surface.critical.default`       | `--shared-color-surface-critical`               | `--prim-color-red-500-default`   |
| `shared.color.surface.critical.hover`         | `--shared-color-surface-critical-hover`         | `--prim-color-red-600`           |
| `shared.color.surface.critical.pressed`       | `--shared-color-surface-critical-pressed`       | `--prim-color-red-700`           |
| `shared.color.surface.critical.light-default` | `--shared-color-surface-critical-light-default` | `--prim-color-red-100`           |
| `shared.color.surface.critical.light-hover`   | `--shared-color-surface-critical-light-hover`   | `--prim-color-red-200`           |
| `shared.color.surface.critical.light-pressed` | `--shared-color-surface-critical-light-pressed` | `--prim-color-red-300`           |
| `shared.color.surface.warning.light-default`  | `--shared-color-surface-warning-light-default`  | `--prim-color-orange-100`        |
| `shared.color.surface.warning.light-hover`    | `--shared-color-surface-warning-light-hover`    | `--prim-color-orange-200`        |
| `shared.color.surface.warning.light-pressed`  | `--shared-color-surface-warning-light-pressed`  | `--prim-color-orange-300`        |
| `shared.color.surface.activity.light-default` | `--shared-color-surface-activity-light-default` | `--prim-color-blue-100`          |
| `shared.color.surface.activity.light-hover`   | `--shared-color-surface-activity-light-hover`   | `--prim-color-blue-200`          |
| `shared.color.surface.activity.light-pressed` | `--shared-color-surface-activity-light-pressed` | `--prim-color-blue-300`          |

### Design/material surfaces

| Figma token                            | CSS custom property                      | Resolves to                           |
| -------------------------------------- | ---------------------------------------- | ------------------------------------- |
| `shared.color.surface.leinen`          | `--shared-color-surface-leinen`          | `--prim-color-design-leinen`          |
| `shared.color.surface.leinen-light`    | `--shared-color-surface-leinen-light`    | `--prim-color-design-leinen-light`    |
| `shared.color.surface.sandstein`       | `--shared-color-surface-sandstein`       | `--prim-color-design-sandstein`       |
| `shared.color.surface.sandstein-light` | `--shared-color-surface-sandstein-light` | `--prim-color-design-sandstein-light` |
| `shared.color.surface.estrich`         | `--shared-color-surface-estrich`         | `--prim-color-design-estrich`         |
| `shared.color.surface.estrich-light`   | `--shared-color-surface-estrich-light`   | `--prim-color-design-estrich-light`   |
| `shared.color.surface.jakobskraut`     | `--shared-color-surface-jakobskraut`     | `--prim-color-design-jakobskraut`     |
| `shared.color.surface.terracotta`      | `--shared-color-surface-terracotta`      | `--prim-color-design-terrakotta`      |
| `shared.color.surface.schwarz-esche`   | `--shared-color-surface-schwarz-esche`   | `--prim-color-design-schwarz-esche`   |
| `shared.color.surface.latsche`         | `--shared-color-surface-latsche`         | `--prim-color-design-latsche`         |
| `shared.color.surface.schlern`         | `--shared-color-surface-schlern`         | `--prim-color-design-schlern`         |

### Web-only surface tokens

| Figma token                                | CSS custom property                          | Resolves to                              |
| ------------------------------------------ | -------------------------------------------- | ---------------------------------------- |
| `web.color.surface.action-on-media`        | `--web-color-surface-action-on-media`        | `--prim-color-black-t075`                |
| `web.color.surface.action-on-media-invert` | `--web-color-surface-action-on-media-invert` | `--prim-color-white-t025`                |
| `web.color.surface.elevated`               | `--web-color-surface-elevated`               | `--shared-color-surface-sandstein-light` |

---

## 3. Text Colors

These map Figma's `themes.modes.Light.shared.color.text.*` to CSS. **Use these for `color` on text elements.**

File: `colors-text.css`

### Primary text

| Figma token                         | CSS custom property                 | Resolves to               |
| ----------------------------------- | ----------------------------------- | ------------------------- |
| `shared.color.text.primary.default` | `--shared-color-text-primary`       | `--prim-color-black`      |
| `shared.color.text.primary.hover`   | `--shared-color-text-primary-hover` | `--prim-color-black-t060` |

### Secondary text

| Figma token                           | CSS custom property                     | Resolves to               |
| ------------------------------------- | --------------------------------------- | ------------------------- |
| `shared.color.text.secondary.default` | `--shared-color-text-secondary`         | `--prim-color-black-t060` |
| `shared.color.text.secondary.hover`   | `--shared-color-text-secondary-hover`   | `--prim-color-black`      |
| `shared.color.text.secondary.pressed` | `--shared-color-text-secondary-pressed` | `--prim-color-black`      |

### Brand text

| Figma token                                 | CSS custom property                           | Resolves to                              |
| ------------------------------------------- | --------------------------------------------- | ---------------------------------------- |
| `shared.color.text.brand.primary-default`   | `--shared-color-text-brand`                   | `--prim-color-brand-primary-600-default` |
| `shared.color.text.brand.primary-hover`     | `--shared-color-text-brand-hover`             | `--prim-color-brand-primary-700`         |
| `shared.color.text.brand.primary-pressed`   | `--shared-color-text-brand-pressed`           | `--prim-color-brand-primary-800`         |
| `shared.color.text.brand.primary-aa`        | `--shared-color-text-brand-aa`                | `--prim-color-brand-primary-700`         |
| `shared.color.text.brand.secondary-default` | `--shared-color-text-brand-secondary-default` | `--prim-color-brand-secondary`           |
| `shared.color.text.brand.secondary-hover`   | `--shared-color-text-brand-secondary-hover`   | `--prim-color-blue-600`                  |
| `shared.color.text.brand.secondary-pressed` | `--shared-color-text-brand-secondary-pressed` | `--prim-color-blue-700`                  |

### Inverted text (for dark backgrounds)

| Figma token                          | CSS custom property                    | Resolves to               |
| ------------------------------------ | -------------------------------------- | ------------------------- |
| `shared.color.text.invert.primary`   | `--shared-color-text-invert`           | `--prim-color-white`      |
| `shared.color.text.invert.secondary` | `--shared-color-text-invert-secondary` | `--prim-color-white-t060` |
| `shared.color.text.invert.disabled`  | `--shared-color-text-invert-disabled`  | `--prim-color-white-t060` |

### Disabled text

| Figma token                          | CSS custom property            | Resolves to               |
| ------------------------------------ | ------------------------------ | ------------------------- |
| `shared.color.text.disabled.default` | `--shared-color-text-disabled` | `--prim-color-black-t060` |

### Status text

| Figma token                               | CSS custom property                         | Resolves to                      |
| ----------------------------------------- | ------------------------------------------- | -------------------------------- |
| `shared.color.text.success.default`       | `--shared-color-text-success`               | `--prim-color-green-500-default` |
| `shared.color.text.success.hover`         | `--shared-color-text-success-hover`         | `--prim-color-green-600`         |
| `shared.color.text.success.pressed`       | `--shared-color-text-success-pressed`       | `--prim-color-green-700`         |
| `shared.color.text.success.dark-default`  | `--shared-color-text-success-dark-default`  | `--prim-color-green-800`         |
| `shared.color.text.success.dark-hover`    | `--shared-color-text-success-dark-hover`    | `--prim-color-green-900`         |
| `shared.color.text.critical.default`      | `--shared-color-text-critical`              | `--prim-color-red-500-default`   |
| `shared.color.text.critical.hover`        | `--shared-color-text-critical-hover`        | `--prim-color-red-600`           |
| `shared.color.text.critical.pressed`      | `--shared-color-text-critical-pressed`      | `--prim-color-red-700`           |
| `shared.color.text.critical.dark-default` | `--shared-color-text-critical-dark-default` | `--prim-color-red-800`           |
| `shared.color.text.critical.dark-hover`   | `--shared-color-text-critical-dark-hover`   | `--prim-color-red-900`           |
| `shared.color.text.warning.dark-default`  | `--shared-color-text-warning-dark`          | `--prim-color-orange-800`        |
| `shared.color.text.warning.dark-hover`    | `--shared-color-text-warning-dark-hover`    | `--prim-color-brand-primary-900` |
| `shared.color.text.activity.dark-default` | `--shared-color-text-activity-dark`         | `--prim-color-blue-800`          |
| `shared.color.text.activity.dark-hover`   | `--shared-color-text-activity-dark-hover`   | `--prim-color-blue-900`          |

### Icon colors

Figma defines `shared.color.icon.*` tokens. In CSS, **icon colors reuse the text tokens** -- there are no separate `--shared-color-icon-*` custom properties. Use the corresponding `--shared-color-text-*` token for icon `color` or `fill`.

---

## 4. Border Colors

These map Figma's `themes.modes.Light.shared.color.border.*` to CSS.

File: `colors-border.css`

| Figma token                              | CSS custom property                        | Resolves to                              |
| ---------------------------------------- | ------------------------------------------ | ---------------------------------------- |
| `shared.color.border.primary`            | `--shared-color-border-full`               | `--prim-color-black`                     |
| `shared.color.border.subtle`             | `--shared-color-border-subtle`             | `--prim-color-neutral-100`               |
| `shared.color.border.subtle-transparent` | `--shared-color-border-subtle-transparent` | `--prim-color-black-t010`                |
| `shared.color.border.distinct`           | `--shared-color-border-distinct`           | `--prim-color-neutral-300`               |
| `shared.color.border.brand-primary`      | `--shared-color-border-brand`              | `--prim-color-brand-primary-600-default` |
| `shared.color.border.focus`              | `--shared-color-border-full`               | `--prim-color-black` (same as primary)   |
| `shared.color.border.disabled`           | `--shared-color-border-disabled`           | `--prim-color-neutral-500`               |
| `shared.color.border.invert`             | `--shared-color-border-invert`             | `--prim-color-white`                     |
| `shared.color.border.invert-subtle`      | `--shared-color-border-invert-subtle`      | `--prim-color-white-t010`                |
| `shared.color.border.success`            | `--shared-color-border-success`            | `--prim-color-green-500-default`         |
| `shared.color.border.critical`           | `--shared-color-border-critical`           | `--prim-color-red-500-default`           |

**Naming difference:** Figma's `shared.color.border.primary` maps to CSS `--shared-color-border-full` (not `--shared-color-border-primary`).

---

## 5. Typography

File: `typography.css`

### Font families

| Figma token                                     | CSS custom property          | Value                       |
| ----------------------------------------------- | ---------------------------- | --------------------------- |
| `typography.font-family.sans` ("Maax Finstral") | `--typo-Default-font-family` | `Maax Finstral, sans-serif` |
| `typography.font-family.serif` ("HW Cigars")    | `--typo-Serif-font-family`   | `Cigars, serif`             |

### Font size mapping (Figma px to CSS rem)

Typography tokens are **responsive** -- they change value at the `64em` breakpoint. The table below shows both viewport values.

| Figma token                            | CSS custom property                           | Mobile/Tablet     | Desktop           |
| -------------------------------------- | --------------------------------------------- | ----------------- | ----------------- |
| `shared.font-size.headline-xxl`        | `--typo-HeadlineXXL-font-size`                | `2.25rem` (36px)  | `4rem` (64px)     |
| `shared.font-size.headline-xl`         | `--typo-HeadlineXL-font-size`                 | `1.75rem` (28px)  | `3rem` (48px)     |
| `shared.font-size.headline-lg`         | `--typo-HeadlineL-font-size`                  | `1.625rem` (26px) | `2.25rem` (36px)  |
| `shared.font-size.headline-md`         | `--typo-HeadlineM-font-size`                  | `1.5rem` (24px)   | `1.75rem` (28px)  |
| `shared.font-size.headline-sm`         | `--typo-HeadlineS-font-size`                  | `1.25rem` (20px)  | `1.5rem` (24px)   |
| `shared.font-size.headline-serif-xl`   | `--typo-HeadlineSerifXL-font-size`            | `1.625rem` (26px) | `3.5rem` (56px)   |
| `shared.font-size.headline-serif-md`   | `--typo-HeadlineSerifM-font-size`             | `1.25rem` (20px)  | `1.75rem` (28px)  |
| `shared.font-size.title-magazin-serif` | `--typo-HeadlineSerifTitleMagazine-font-size` | `3rem` (48px)     | `6.5rem` (104px)  |
| `shared.font-size.text-xl`             | `--typo-TextXL-font-size`                     | `1.125rem` (18px) | `1.25rem` (20px)  |
| `shared.font-size.text-lg`             | `--typo-TextL-font-size`                      | `1rem` (16px)     | `1.125rem` (18px) |
| `shared.font-size.text-md`             | `--typo-TextM-font-size`                      | `0.875rem` (14px) | `1rem` (16px)     |
| `shared.font-size.text-sm`             | `--typo-TextS-font-size`                      | `0.75rem` (12px)  | `0.875rem` (14px) |

### Shorthand typography tokens

For convenience, use the shorthand custom properties that combine weight, size, line-height, and font-family into the CSS `font` shorthand:

```css
/* Responsive (changes at 64em breakpoint) */
font: var(--typo-HeadlineXXL);
font: var(--typo-HeadlineXL);
font: var(--typo-HeadlineL);
font: var(--typo-HeadlineM);
font: var(--typo-HeadlineS);
font: var(--typo-HeadlineSerifMagazineTitle);
font: var(--typo-HeadlineSerifXL);
font: var(--typo-HeadlineSerifL);
font: var(--typo-TextXL);
font: var(--typo-TextL);
font: var(--typo-TextM);
font: var(--typo-TextS);

/* Static (same across all viewports) */
font: var(--typo-static-HeadlineXXL);
font: var(--typo-static-HeadlineXL);
font: var(--typo-static-HeadlineL);
font: var(--typo-static-HeadlineM);
font: var(--typo-static-HeadlineS);
font: var(--typo-static-TextXL);
font: var(--typo-static-TextL);
font: var(--typo-static-TextM);
font: var(--typo-static-TextS);
font: var(--typo-static-TextXS);

/* Static bold variants */
font: var(--typo-static-TextXL-bold);
font: var(--typo-static-TextL-bold);
font: var(--typo-static-TextM-bold);
font: var(--typo-static-TextS-bold);
font: var(--typo-static-TextXS-bold);
```

### Font weight

| Figma token                | CSS custom property          | Value |
| -------------------------- | ---------------------------- | ----- |
| `font-weight.sans.regular` | `--typo-regular-font-weight` | `400` |
| `font-weight.sans.bolder`  | `--typo-bold-font-weight`    | `700` |

### Line height

Figma defines named line-heights. In CSS these are embedded in the typography shorthand tokens, not exposed as standalone custom properties. For reference:

| Figma token                                 | CSS value |
| ------------------------------------------- | --------- |
| `line-height.single` (100%)                 | `1`       |
| `line-height.tight` (120%)                  | `1.2`     |
| `line-height.default` (135%)                | `1.35`    |
| `line-height.loose` (150%)                  | `1.5`     |
| `line-height.headline.tight` (90%)          | `0.9`     |
| `line-height.headline.default` (100%)       | `1`       |
| `line-height.headline.default-serif` (110%) | `1.1`     |
| `line-height.headline.loose` (110%)         | `1.1`     |

---

## 6. Sizes and Spacing

File: `sizes.css`

### Primitive size scale

Figma's `primitives.prim-size` maps to the `--size-*` scale. Values in Figma are in **px** and are converted to **rem** in CSS.

| Figma token     | CSS custom property | Figma px | CSS rem    |
| --------------- | ------------------- | -------- | ---------- |
| `prim-size.0`   | (use `0` directly)  | 0        | 0          |
| `prim-size.0_5` | `--size-2`          | 2        | `0.125rem` |
| `prim-size.1`   | `--size-4`          | 4        | `0.25rem`  |
| `prim-size.2`   | `--size-8`          | 8        | `0.5rem`   |
| `prim-size.3`   | `--size-12`         | 12       | `0.75rem`  |
| `prim-size.4`   | `--size-16`         | 16       | `1rem`     |
| `prim-size.5`   | `--size-20`         | 20       | `1.25rem`  |
| `prim-size.6`   | `--size-24`         | 24       | `1.5rem`   |
| `prim-size.8`   | `--size-32`         | 32       | `2rem`     |
| `prim-size.9`   | `--size-36`         | 36       | `2.25rem`  |
| `prim-size.10`  | `--size-40`         | 40       | `2.5rem`   |
| `prim-size.12`  | `--size-48`         | 48       | `3rem`     |
| `prim-size.14`  | `--size-56`         | 56       | `3.5rem`   |
| `prim-size.16`  | `--size-64`         | 64       | `4rem`     |
| `prim-size.18`  | `--size-72`         | 72       | `4.5rem`   |
| `prim-size.20`  | `--size-80`         | 80       | `5rem`     |
| `prim-size.22`  | `--size-88`         | 88       | `5.5rem`   |
| `prim-size.24`  | `--size-96`         | 96       | `6rem`     |
| `prim-size.26`  | `--size-104`        | 104      | `6.5rem`   |
| `prim-size.28`  | `--size-112`        | 112      | `7rem`     |
| `prim-size.30`  | `--size-120`        | 120      | `7.5rem`   |
| `prim-size.32`  | `--size-128`        | 128      | `8rem`     |
| `prim-size.36`  | `--size-144`        | 144      | `9rem`     |

**Note:** The CSS size scale uses the **px value** as the token name (e.g. `--size-24` for 24px / 1.5rem), not the Figma step number (which would be `prim-size.6`). Not every Figma step has a corresponding CSS token -- only the values listed above are defined.

### Section spacing (responsive)

| Figma token                      | CSS custom property            | Mobile (<48rem)      | Tablet/Desktop (>=48rem) |
| -------------------------------- | ------------------------------ | -------------------- | ------------------------ |
| `shared.spacing.gap.sections.sm` | `--shared-spacing-sections-sm` | `--size-24` (1.5rem) | `--size-32` (2rem)       |
| `shared.spacing.gap.sections.md` | `--shared-spacing-sections-md` | `--size-48` (3rem)   | `--size-64` (4rem)       |
| `shared.spacing.gap.sections.lg` | `--shared-spacing-sections-lg` | `--size-64` (4rem)   | `--size-96` (6rem)       |
| `shared.spacing.gap.sections.xl` | `--shared-spacing-sections-xl` | `--size-96` (6rem)   | `--size-128` (8rem)      |

---

## 7. Responsive Tokens Not Yet in CSS

The following Figma tokens exist in `responsive.modes` but do **not** have corresponding CSS custom properties yet. They are documented here for future reference and should be added to CSS as needed.

### Border radius

| Figma token          | Desktop | Tablet/Mobile |
| -------------------- | ------- | ------------- |
| `shared.radius.none` | 0       | 0             |
| `shared.radius.sm`   | 4px     | 4px           |
| `shared.radius.full` | 1024px  | 1024px        |

### Border width

| Figma token              | Value |
| ------------------------ | ----- |
| `shared.border.width.sm` | 1px   |
| `shared.border.width.md` | 2px   |

### Page layout

| Figma token                         | Desktop | Tablet | Mobile |
| ----------------------------------- | ------- | ------ | ------ |
| `web.page.spacing-margin-x`         | 128px   | 24px   | 24px   |
| `web.page.spacing-gutter-x`         | 24px    | 16px   | 16px   |
| `web.page.size-max-width-container` | 1344px  | 720px  | 327px  |

### Button sizing

| Figma token                    | Value (all viewports) |
| ------------------------------ | --------------------- |
| `shared.button.spacing-gap-x`  | 8px                   |
| `shared.button.xs.size-height` | 20px                  |
| `shared.button.sm.size-height` | 32px                  |
| `shared.button.md.size-height` | 40px                  |
| `shared.button.lg.size-height` | 48px                  |

### Form field sizing

| Figma token                         | Desktop | Tablet/Mobile |
| ----------------------------------- | ------- | ------------- |
| `shared.form-fields.sm.size-height` | 32px    | 32px          |
| `shared.form-fields.md.size-height` | 48px    | 40px          |
| `shared.form-fields.size-max-width` | 896px   | 896px         |

---

## 8. Light High Contrast Theme Overrides

The `Light High Contrast` theme in Figma overrides a small set of tokens from the default `Light` theme. These are listed here for awareness. Currently CSS only implements the `Light` theme values.

| Token path                                   | Light value                              | High Contrast value                        |
| -------------------------------------------- | ---------------------------------------- | ------------------------------------------ |
| `shared.color.surface.terracotta`            | `--prim-color-design-terrakotta`         | `--prim-color-design-terrakotta-darker-aa` |
| `shared.color.surface.schlern`               | `--prim-color-design-schlern`            | `--prim-color-design-schlern-darker-aa`    |
| `shared.color.surface.brand.primary-default` | `--prim-color-brand-primary-600-default` | `--prim-color-brand-primary-700`           |
| `shared.color.surface.brand.primary-hover`   | `--prim-color-brand-primary-700`         | `--prim-color-brand-primary-800`           |
| `shared.color.surface.brand.primary-pressed` | `--prim-color-brand-primary-800`         | `--prim-color-brand-primary-900`           |
| `shared.color.text.brand.primary-default`    | `--prim-color-brand-primary-600-default` | `--prim-color-brand-primary-700`           |
| `shared.color.text.brand.primary-hover`      | `--prim-color-brand-primary-700`         | `--prim-color-brand-primary-800`           |
| `shared.color.text.brand.primary-pressed`    | `--prim-color-brand-primary-800`         | `--prim-color-brand-primary-900`           |
| `shared.color.border.brand-primary`          | `--prim-color-brand-primary-600-default` | `--prim-color-brand-primary-700`           |
| `shared.color.surface.overlay.image`         | `--prim-color-black-t020`                | `--prim-color-black-t050`                  |

---

## Quick reference: Naming conventions

### Figma to CSS name translation rules

1. **Dots become hyphens:** `prim-color.blue.500_default` becomes `--prim-color-blue-500-default`
2. **Underscores in Figma scale steps become hyphens:** `600_default` becomes `600-default`, `500_default` becomes `500-default`
3. **Semantic token prefix:** `shared.color.*` becomes `--shared-color-*`, `web.color.*` becomes `--web-color-*`
4. **Size tokens use the px value as name:** Figma step `prim-size.6` (= 24px) maps to `--size-24`
5. **Typography tokens use PascalCase:** `--typo-HeadlineXL`, `--typo-TextM`, `--typo-static-TextS-bold`
6. **Figma px values must be converted to rem in CSS:** divide by 16 (e.g. 24px = 1.5rem)

### When to use which prefix

| CSS prefix                 | When to use                                               | Example                        |
| -------------------------- | --------------------------------------------------------- | ------------------------------ |
| `--prim-color-*`           | Never in components -- only referenced by semantic tokens | `--prim-color-black`           |
| `--shared-color-surface-*` | Background colors                                         | `--shared-color-surface-brand` |
| `--shared-color-text-*`    | Text and icon colors                                      | `--shared-color-text-primary`  |
| `--shared-color-border-*`  | Border colors                                             | `--shared-color-border-subtle` |
| `--web-color-*`            | Web-platform-specific colors                              | `--web-color-surface-elevated` |
| `--typo-*`                 | Responsive typography (changes with viewport)             | `--typo-HeadlineXL`            |
| `--typo-static-*`          | Fixed typography (same across viewports)                  | `--typo-static-TextM`          |
| `--size-*`                 | Spacing, sizing, dimensions                               | `--size-24`                    |
| `--shared-spacing-*`       | Responsive section spacing                                | `--shared-spacing-sections-md` |
