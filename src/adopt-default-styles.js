// @ts-check

/** Document node type (ECMA-262 / DOM). */
const DOCUMENT_NODE = 9;

/**
 * @param {unknown} root
 * @returns {root is Document | ShadowRoot}
 */
function isDocumentOrShadowRoot(root) {
  if (root == null || typeof root !== "object") {
    return false;
  }
  const node = /** @type {Node} */ (root);
  if (node.nodeType === DOCUMENT_NODE) {
    return true;
  }
  return typeof ShadowRoot !== "undefined" && root instanceof ShadowRoot;
}

/**
 * @param {Document | ShadowRoot} root
 * @returns {boolean}
 */
function hasAdoptedStyleSheets(root) {
  return (
    "adoptedStyleSheets" in root &&
    Array.isArray(/** @type {{ adoptedStyleSheets: CSSStyleSheet[] }} */ (root).adoptedStyleSheets)
  );
}

/** @type {WeakSet<Document | ShadowRoot>} */
const rootsWithAdoptedDefault = new WeakSet();

/**
 * Adopt the default [`masonry-grid-lanes.css`](./masonry-grid-lanes.css) for a document or shadow root.
 * Uses constructable stylesheets when supported; otherwise inserts a `<link rel="stylesheet">` (document only).
 * Calling again on the same root is a no-op.
 *
 * @param {Document | ShadowRoot} [root]
 * @returns {Promise<void>}
 */
export async function adoptMasonryGridLanesStyles(root = document) {
  if (!isDocumentOrShadowRoot(root)) {
    throw new TypeError("adoptMasonryGridLanesStyles: root must be Document or ShadowRoot");
  }
  if (rootsWithAdoptedDefault.has(root)) {
    return;
  }

  const cssUrl = new URL("masonry-grid-lanes.css", import.meta.url);
  const href = cssUrl.href;

  if (hasAdoptedStyleSheets(root)) {
    const sheet = new CSSStyleSheet();
    const response = await fetch(href);
    if (!response.ok) {
      throw new Error(`Failed to load ${href}: HTTP ${response.status}`);
    }
    const text = await response.text();
    await sheet.replace(text);
    const target = /** @type {{ adoptedStyleSheets: CSSStyleSheet[] }} */ (root);
    const next = [...target.adoptedStyleSheets, sheet];
    target.adoptedStyleSheets = next;
    rootsWithAdoptedDefault.add(root);
    return;
  }

  if (root instanceof Document) {
    const id = "masonry-grid-lanes-default-styles";
    if (root.getElementById(id)) {
      rootsWithAdoptedDefault.add(root);
      return;
    }
    const link = root.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = href;
    root.head.appendChild(link);
    rootsWithAdoptedDefault.add(root);
    return;
  }

  throw new Error(
    "adoptMasonryGridLanesStyles: ShadowRoot requires support for adoptedStyleSheets in this browser.",
  );
}
