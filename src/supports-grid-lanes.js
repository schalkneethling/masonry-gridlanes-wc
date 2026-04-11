// @ts-check

/** @type {boolean | null} */
let cached = null;

/**
 * Whether the user agent reports support for `display: grid-lanes` (CSS Grid Level 3).
 * Result is cached for the lifetime of the module unless {@link resetSupportsGridLanesCache} is called.
 *
 * @returns {boolean}
 */
export function supportsGridLanes() {
  if (cached !== null) {
    return cached;
  }
  if (typeof CSS === "undefined" || typeof CSS.supports !== "function") {
    cached = false;
    return false;
  }
  /* Use the single-argument support-condition form so the JS check stays aligned
   * with CSS `@supports`, without relying on the optional wrapper parentheses. */
  cached = CSS.supports("display: grid-lanes");
  return cached;
}

/** Reset cache (for tests). */
export function resetSupportsGridLanesCache() {
  cached = null;
}
