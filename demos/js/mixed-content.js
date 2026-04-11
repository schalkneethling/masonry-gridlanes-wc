// @ts-nocheck

import { fetchAuthorFeed, getEmbedThumbUrl, getPostText } from "./bsky.js";
import { UNSPLASH_TILES, shuffle, unsplashPageUrl, unsplashSrc } from "./unsplash-pool.js";

const ACTOR = "schalkneethling.com";
const BALANCED_TEXT_DATASET = [
  "Short note about testing layout tie-breakers in masonry.",
  "A slightly longer paragraph that still stays compact, giving the layout engine a chance to place it in more than one nearly balanced lane.",
  "Compact card.",
  "This card is long enough to wrap a bit, but not so long that it dominates the whole column on its own.",
  "Another small card for balancing.",
  "A medium-sized text block that helps create near ties between the current shortest columns in the demo.",
  "Tiny note.",
  "This sentence is here to nudge the lane heights close together so the flow tolerance control has an easier effect to demonstrate.",
  "Small but not minuscule.",
  "Another balanced paragraph with enough words to wrap twice on narrower columns and once on wider ones.",
  "A narrow tie-breaker card.",
  "The idea of this dataset is not realism; it is to make the flow tolerance attribute visibly teachable.",
];
const ROW_TEXT_DATASET = [
  "Compact synopsis card for a horizontally scrolling row-lanes feed.",
  "Media-heavy row masonry works better when each card has an intentional inline size instead of relying on whatever max-content width falls out of the markup.",
  "A short note that sits comfortably beside an image card.",
  "This row-mode example uses fixed media heights and bounded copy so the demo teaches a repeatable production pattern instead of an accidental layout.",
  "Cards can still vary in width, but the range should be curated.",
  "When the host becomes the scroll surface, row lanes feel like a deliberate gallery rail rather than a broken column layout.",
  "Small cards help the rhythm feel varied.",
  "Authors should decide where horizontal scrolling is acceptable and then constrain the card family accordingly.",
  "Another compact editorial block for balancing the sequence.",
];

const ROW_CARD_WIDTHS = [260, 300, 340, 280, 320, 360];

/**
 * @param {string} text
 * @param {number} max
 * @returns {string}
 */
function compactText(text, max) {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

/**
 * @returns {Promise<{ plan: { type: string, payload?: unknown }[], statusText: string }>}
 */
export async function loadMixedPlan() {
  /** @type {{ type: string, payload?: unknown }[]} */
  const plan = [];

  let bskyItems = [];
  /** @type {string | null} */
  let blueskyNote = null;
  try {
    const data = await fetchAuthorFeed(ACTOR, 50);
    bskyItems = data.feed.filter((it) => getPostText(it).length > 0);
  } catch {
    blueskyNote = "Bluesky unreachable — Unsplash tiles only.";
  }

  const photos = shuffle([...UNSPLASH_TILES]).slice(0, 14);
  let photoIndex = 0;
  let feedIndex = 0;
  const maxTiles = 28;

  for (
    let index = 0;
    index < maxTiles && (photoIndex < photos.length || feedIndex < bskyItems.length);
    index++
  ) {
    const phase = index % 4;
    if (phase === 0 && photoIndex < photos.length) {
      plan.push({ type: "unsplash", payload: photos[photoIndex++] });
      continue;
    }
    if (phase === 1 && feedIndex < bskyItems.length) {
      plan.push({ type: "bsky-text", payload: bskyItems[feedIndex++] });
      continue;
    }
    if ((phase === 2 || phase === 3) && feedIndex < bskyItems.length) {
      plan.push({ type: "bsky-card", payload: bskyItems[feedIndex++] });
      continue;
    }
    if (photoIndex < photos.length) {
      plan.push({ type: "unsplash", payload: photos[photoIndex++] });
    } else if (feedIndex < bskyItems.length) {
      plan.push({ type: "bsky-card", payload: bskyItems[feedIndex++] });
    }
  }

  return {
    plan,
    statusText: blueskyNote
      ? `${plan.length} tiles · ${blueskyNote}`
      : `${plan.length} tiles · Unsplash + @${ACTOR}`,
  };
}

/**
 * @returns {Promise<{ plan: { type: string, payload?: unknown }[], statusText: string }>}
 */
export async function loadRowPlan() {
  /** @type {{ type: string, payload?: unknown }[]} */
  const plan = [];

  const photos = shuffle([...UNSPLASH_TILES]).slice(0, 9);
  let photoIndex = 0;
  let textIndex = 0;
  const maxTiles = 18;

  for (
    let index = 0;
    index < maxTiles && (photoIndex < photos.length || textIndex < ROW_TEXT_DATASET.length);
    index += 1
  ) {
    const width = ROW_CARD_WIDTHS[index % ROW_CARD_WIDTHS.length] ?? 320;
    const phase = index % 2;
    if (phase === 0 && photoIndex < photos.length) {
      plan.push({ type: "row-unsplash", payload: { entry: photos[photoIndex++], width } });
      continue;
    }
    if (textIndex < ROW_TEXT_DATASET.length) {
      plan.push({
        type: "row-copy",
        payload: { text: ROW_TEXT_DATASET[textIndex++], width },
      });
      continue;
    }
    if (photoIndex < photos.length) {
      plan.push({ type: "row-unsplash", payload: { entry: photos[photoIndex++], width } });
    }
  }

  return {
    plan,
    statusText: `${plan.length} row cards · constrained widths + fixed media crops`,
  };
}

/**
 * @param {HTMLElement} grid
 * @param {{ type: string, payload?: unknown }[]} plan
 */
export function renderMixedPlan(grid, plan) {
  grid.replaceChildren();

  for (const step of plan) {
    if (step.type === "unsplash") {
      const entry = /** @type {(typeof UNSPLASH_TILES)[0]} */ (step.payload);
      const fig = document.createElement("figure");
      fig.className = "demo-tile-img";

      const img = document.createElement("img");
      img.src = unsplashSrc(entry);
      img.alt = `Photograph by ${entry.credit}`;
      img.loading = "lazy";

      const cap = document.createElement("figcaption");
      const link = document.createElement("a");
      link.href = unsplashPageUrl(entry);
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = `${entry.credit} · Unsplash`;
      cap.appendChild(link);

      fig.append(img, cap);
      grid.appendChild(fig);
      continue;
    }

    if (step.type === "bsky-text") {
      const item = step.payload;
      const text = getPostText(item);
      const tile = document.createElement("article");
      tile.className = "demo-tile-text";
      tile.textContent = text;
      grid.appendChild(tile);
      continue;
    }

    if (step.type === "bsky-card") {
      const item = step.payload;
      const text = getPostText(item);
      const thumb = getEmbedThumbUrl(item);
      const art = document.createElement("article");
      art.className = thumb ? "demo-card" : "demo-card demo-card--text-only";

      if (thumb) {
        const img = document.createElement("img");
        img.className = "demo-card-media";
        img.src = thumb;
        img.alt = "";
        img.loading = "lazy";
        art.appendChild(img);
      }

      const body = document.createElement("div");
      body.className = "demo-card-body";
      body.textContent = text;
      art.appendChild(body);
      grid.appendChild(art);
      continue;
    }

    if (step.type === "balanced-text") {
      const item = /** @type {{ text: string, label?: string }} */ (step.payload);
      const tile = document.createElement("article");
      tile.className = "demo-tile-text";
      tile.textContent = item.text;
      if (item.label) {
        tile.setAttribute("aria-label", item.label);
      }
      grid.appendChild(tile);
    }

    if (step.type === "row-unsplash") {
      const payload = /** @type {{ entry: (typeof UNSPLASH_TILES)[0], width: number }} */ (
        step.payload
      );
      const fig = document.createElement("figure");
      fig.className = "demo-row-card demo-row-card--image";
      fig.style.width = `${payload.width}px`;

      const img = document.createElement("img");
      img.className = "demo-row-card-media";
      img.src = unsplashSrc(payload.entry);
      img.alt = `Photograph by ${payload.entry.credit}`;
      img.loading = "lazy";

      const cap = document.createElement("figcaption");
      const credit = document.createElement("span");
      credit.className = "demo-row-card-kicker";
      credit.textContent = "Unsplash";
      const text = document.createElement("p");
      text.className = "demo-row-card-copy";
      text.textContent = `${payload.entry.credit} · landscape study`;
      cap.append(credit, text);

      fig.append(img, cap);
      grid.appendChild(fig);
      continue;
    }

    if (step.type === "row-copy") {
      const payload = /** @type {{ text: string, width: number }} */ (step.payload);
      const text = compactText(payload.text, 180);
      const tile = document.createElement("article");
      tile.className = "demo-row-card demo-row-card--text";
      tile.style.width = `${payload.width}px`;

      const kicker = document.createElement("p");
      kicker.className = "demo-row-card-kicker";
      kicker.textContent = "Row note";
      const body = document.createElement("p");
      body.className = "demo-row-card-copy";
      body.textContent = text;
      tile.append(kicker, body);
      grid.appendChild(tile);
      continue;
    }
  }
}

/**
 * @returns {{ plan: { type: string, payload?: unknown }[], statusText: string }}
 */
export function loadBalancedFlowPlan() {
  return {
    plan: BALANCED_TEXT_DATASET.map((text, index) => ({
      type: "balanced-text",
      payload: {
        text,
        label: `Balanced card ${index + 1}`,
      },
    })),
    statusText: `${BALANCED_TEXT_DATASET.length} balanced text cards · tuned to make flow-tolerance easier to see`,
  };
}
