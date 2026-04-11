// @ts-nocheck

import { fetchAuthorFeed, getPostText } from "./bsky.js";
import { mountRuntimeNotice } from "./init-demo.js";
import {
  adoptMasonryGridLanesStyles,
  layoutPretextMasonry,
  sampleTextMetricsFromElement,
} from "/src/index.js";

const ACTOR = "schalkneethling.com";
const MIN_COLUMN_WIDTH = 280;
const GAP = 16;
const VIEWPORT_OVERSCAN = 240;

/**
 * Each card keeps its prepared-text cache next to the source data. That lets us reuse Pretext's
 * `prepare()` work across every resize without keeping every card mounted in the DOM.
 *
 * @typedef {{
 *   id: string,
 *   text: string,
 *   cache: Record<string, unknown>,
 * }} TextCard
 */

/** @typedef {{ top: number, left: number, width: number, height: number, cardIndex: number }} PositionedCard */

/**
 * The public headless API intentionally keeps DOM sampling separate from layout. The demo creates a
 * probe element once, samples card metrics, and then hands that to the pure Pretext layout helper.
 *
 * @param {HTMLElement} host
 */
function readTextCardMetrics(host) {
  const probe = document.createElement("article");
  probe.className = "demo-tile-text";
  probe.textContent = "Pretext probe";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  probe.style.position = "absolute";
  probe.style.inset = "0 auto auto 0";
  host.appendChild(probe);

  const metrics = sampleTextMetricsFromElement(probe);
  probe.remove();
  return metrics;
}

/**
 * Compute the full masonry layout for all cards. The visible-window render step can then mount
 * just the cards that intersect the viewport, which is where the DOM savings come from.
 *
 * @param {TextCard[]} cards
 * @param {number} containerWidth
 * @param {{ font: string, lineHeight: number, inlineChrome: number, blockChrome: number }} metrics
 * @returns {{ positions: PositionedCard[], totalHeight: number }}
 */
function computeLayout(cards, containerWidth, metrics) {
  const { positions, totalHeight } = layoutPretextMasonry({
    containerWidth,
    minColumnWidth: MIN_COLUMN_WIDTH,
    gap: GAP,
    metrics,
    items: cards,
  });

  return {
    positions: positions.map((position, index) => ({
      cardIndex: index,
      top: position.top,
      left: position.left,
      width: position.width,
      height: totalHeight === 0 ? 0 : (position.height ?? 0),
    })),
    totalHeight,
  };
}

/**
 * The DOM cache mirrors the reference demo: nodes exist only while they are visible.
 *
 * @param {TextCard} card
 * @param {Map<string, HTMLElement>} mounted
 * @param {HTMLElement} host
 * @returns {HTMLElement}
 */
function getOrCreateCardNode(card, mounted, host) {
  const existing = mounted.get(card.id);
  if (existing) {
    return existing;
  }

  const node = document.createElement("article");
  node.className = "demo-tile-text";
  node.textContent = card.text;
  host.appendChild(node);
  mounted.set(card.id, node);
  return node;
}

/**
 * We intentionally do not register `<masonry-grid-lanes>` for this page. The generic component is
 * still great for DOM-measured content, but this demo is showcasing the headless Pretext path:
 * cached text preparation, layout math over the full dataset, and DOM virtualization for the
 * visible window only.
 */
async function initTextDemo(host) {
  await adoptMasonryGridLanesStyles(document);
  mountRuntimeNotice();
  if (document.fonts?.ready != null) {
    await document.fonts.ready;
  }
  host.classList.add("demo-grid-host");
}

const grid = document.querySelector("masonry-grid-lanes");
const status = document.getElementById("status");
if (!(grid instanceof HTMLElement) || !(status instanceof HTMLElement)) {
  throw new Error("demo DOM");
}

await initTextDemo(grid);

status.textContent = "Loading Bluesky feed and preparing Pretext layout…";

try {
  const data = await fetchAuthorFeed(ACTOR, 45);
  const cards = data.feed
    .map((item, index) => ({
      id: item.post?.uri ?? `post-${index}`,
      text: getPostText(item),
      cache: {},
    }))
    .filter((card) => card.text.length > 0);

  const textMetrics = readTextCardMetrics(grid);
  /** @type {{ width: number, positions: PositionedCard[], totalHeight: number } | null} */
  let cachedLayout = null;
  const mountedNodes = new Map();
  let scheduledFrame = 0;

  /**
   * Layout only depends on the host width. Scroll changes do not recompute positions; they only
   * change which subset of the already-computed cards stays mounted.
   *
   * @returns {{ width: number, positions: PositionedCard[], totalHeight: number }}
   */
  function getLayout() {
    const width = grid.clientWidth;
    if (cachedLayout?.width === width) {
      return cachedLayout;
    }

    const next = computeLayout(cards, width, textMetrics);
    cachedLayout = { width, ...next };
    return cachedLayout;
  }

  /**
   * Single-pass render: one batch of reads up front, then only DOM writes. That keeps resize and
   * scroll work predictable even when the feed grows.
   */
  function render() {
    scheduledFrame = 0;

    const layoutState = getLayout();
    const hostTop = grid.getBoundingClientRect().top + window.scrollY;
    const viewTop = window.scrollY - hostTop - VIEWPORT_OVERSCAN;
    const viewBottom = window.scrollY + window.innerHeight - hostTop + VIEWPORT_OVERSCAN;
    const visibleIds = new Set();

    grid.style.minHeight = `${Math.max(0, layoutState.totalHeight)}px`;

    for (const positioned of layoutState.positions) {
      if (positioned.top > viewBottom || positioned.top + positioned.height < viewTop) {
        continue;
      }

      const card = cards[positioned.cardIndex];
      if (!card) continue;

      visibleIds.add(card.id);
      const node = getOrCreateCardNode(card, mountedNodes, grid);
      node.style.position = "absolute";
      node.style.top = `${positioned.top}px`;
      node.style.left = `${positioned.left}px`;
      node.style.width = `${positioned.width}px`;
      node.style.height = `${positioned.height}px`;
      node.style.boxSizing = "border-box";
    }

    for (const [id, node] of mountedNodes) {
      if (visibleIds.has(id)) {
        continue;
      }
      node.remove();
      mountedNodes.delete(id);
    }
  }

  function scheduleRender() {
    if (scheduledFrame !== 0) {
      return;
    }
    scheduledFrame = requestAnimationFrame(render);
  }

  const resizeObserver = new ResizeObserver(() => {
    cachedLayout = null;
    scheduleRender();
  });
  resizeObserver.observe(grid);

  window.addEventListener("resize", () => {
    cachedLayout = null;
    scheduleRender();
  });
  window.addEventListener("scroll", scheduleRender, { passive: true });

  scheduleRender();
  status.textContent = `${cards.length} text posts prepared with Pretext; only visible cards stay mounted.`;
} catch (error) {
  status.dataset.state = "error";
  status.textContent = error instanceof Error ? error.message : "Failed to load feed.";
}
