// @ts-nocheck

import {
  adoptMasonryGridLanesStyles,
  defineMasonryGridLanes,
  supportsGridLanes,
} from "/src/index.js";

/**
 * @param {{ supportsNative?: boolean } | undefined} options
 */
export function mountRuntimeNotice(options = {}) {
  const runtimeSupports = options.supportsNative ?? supportsGridLanes();
  const wrap = document.querySelector(".demo-wrap");
  const lede = document.querySelector(".demo-lede");
  const status = document.querySelector(".demo-status");

  if (!(wrap instanceof HTMLElement)) {
    return;
  }

  let notice = document.getElementById("runtime-notice");
  if (!(notice instanceof HTMLParagraphElement)) {
    notice = document.createElement("p");
    notice.id = "runtime-notice";
    notice.className = "demo-runtime-notice";
    const anchor =
      status instanceof HTMLElement ? status : lede instanceof HTMLElement ? lede : null;
    if (anchor?.parentNode != null) {
      anchor.parentNode.insertBefore(notice, anchor.nextSibling);
    } else {
      wrap.prepend(notice);
    }
  }

  notice.dataset.runtimeLayout = runtimeSupports ? "native" : "fallback";
  notice.textContent = runtimeSupports
    ? "Your browser supports grid lanes; the browser is handling layout."
    : "Your browser does not support grid lanes; the library is using its supported fallback layout.";
}

/**
 * Register the element and load default masonry styles (needed for fallback layout rules).
 */
export async function initDemo() {
  defineMasonryGridLanes();
  await adoptMasonryGridLanesStyles(document);
  mountRuntimeNotice();
  /* Wait for @font-face (e.g. Spectral) so the first fallback column-height measure matches
   * the final render. */
  if (document.fonts?.ready != null) {
    await document.fonts.ready;
  }
}
