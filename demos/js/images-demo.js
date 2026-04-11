// @ts-nocheck

import { initDemo } from "./init-demo.js";
import { UNSPLASH_TILES, shuffle, unsplashPageUrl, unsplashSrc } from "./unsplash-pool.js";

await initDemo();

const grid = document.querySelector("masonry-grid-lanes");
const status = document.getElementById("status");
if (!grid || !status) throw new Error("demo DOM");

const pool = shuffle(UNSPLASH_TILES).slice(0, 18);

for (const entry of pool) {
  const fig = document.createElement("figure");
  fig.className = "demo-tile-img";

  const img = document.createElement("img");
  img.src = unsplashSrc(entry);
  img.alt = `Photograph by ${entry.credit}`;
  img.loading = "lazy";
  img.decoding = "async";

  const cap = document.createElement("figcaption");
  const a = document.createElement("a");
  a.href = unsplashPageUrl(entry);
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.textContent = `${entry.credit} · Unsplash`;

  cap.appendChild(a);
  fig.append(img, cap);
  grid.appendChild(fig);
}

status.textContent = `${pool.length} images · shuffled`;
