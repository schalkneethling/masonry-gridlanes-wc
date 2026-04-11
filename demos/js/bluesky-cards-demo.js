// @ts-nocheck

import { fetchAuthorFeed, getEmbedThumbUrl, getPostText } from "./bsky.js";
import { initDemo } from "./init-demo.js";

const ACTOR = "schalkneethling.com";

await initDemo();

const grid = document.querySelector("masonry-grid-lanes");
const status = document.getElementById("status");
if (!grid || !status) throw new Error("demo DOM");

status.textContent = "Loading Bluesky…";

try {
  const data = await fetchAuthorFeed(ACTOR, 45);
  const items = data.feed.filter((it) => getPostText(it).length > 0);
  let withMedia = 0;

  for (const it of items) {
    const text = getPostText(it);
    const thumb = getEmbedThumbUrl(it);
    if (thumb) withMedia += 1;

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
  }

  status.textContent = `${items.length} posts · ${withMedia} with embed imagery`;
} catch (e) {
  status.dataset.state = "error";
  status.textContent = e instanceof Error ? e.message : "Failed to load feed.";
}
