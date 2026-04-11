// @ts-nocheck

/**
 * Curated Unsplash photo IDs with target crop dimensions (varied aspect ratios).
 * Hotlinked per Unsplash guidelines for demos; attribution in page footer.
 */
export const UNSPLASH_TILES = [
  { id: "photo-1506905925346-21bda4d32df4", w: 900, h: 520, credit: "Yannick Pulver" },
  { id: "photo-1469474968028-56623f02e42e", w: 720, h: 900, credit: "Robert Lukeman" },
  { id: "photo-1519681393784-d120267933ba", w: 800, h: 500, credit: "Adam Kool" },
  { id: "photo-1472214103451-9374bd1c798e", w: 640, h: 820, credit: "Robert Lukeman" },
  { id: "photo-1501854140801-50d01698950b", w: 880, h: 540, credit: "Qingbao Meng" },
  { id: "photo-1441974231531-c6227db76b6e", w: 700, h: 780, credit: "Lukasz Szmigiel" },
  { id: "photo-1470071459604-3b5ec3a7fe05", w: 920, h: 480, credit: "V2osk" },
  { id: "photo-1518837695005-2083093ee35b", w: 760, h: 760, credit: "Matt Hardy" },
  { id: "photo-1433086966358-54859d0ed716", w: 680, h: 960, credit: "Luca Bravo" },
  { id: "photo-1500530855697-b586d89ba3ee", w: 840, h: 560, credit: "JOHN TOWNER" },
  { id: "photo-1475924156734-496f6cac6ec1", w: 720, h: 640, credit: "Quino Al" },
  { id: "photo-1490750967868-88aa4486c946", w: 780, h: 720, credit: "Aaron Burden" },
  { id: "photo-1504674900247-0877df9cc836", w: 650, h: 880, credit: "Brooke Lark" },
  { id: "photo-1504198458649-3128b932f49e", w: 900, h: 600, credit: "Jared Erondu" },
  { id: "photo-1483728642387-6c3bdd6c93e5", w: 740, h: 740, credit: "Adam Kool" },
  { id: "photo-1507525428034-b723cf961d3e", w: 860, h: 520, credit: "Sean Oulashin" },
  { id: "photo-1549880338-65ddcdfd017b", w: 620, h: 920, credit: "Dawid Zawiła" },
  { id: "photo-1454496522488-7a8e488e8606", w: 820, h: 580, credit: "Paul Gilmore" },
  { id: "photo-1501785888041-af3ef285b470", w: 880, h: 500, credit: "Igor Kasalovic" },
  { id: "photo-1447752875215-b2761acb3c5d", w: 700, h: 800, credit: "Sebastian Unrau" },
];

/**
 * @template T
 * @param {T[]} arr
 * @returns {T[]}
 */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * @param {{ id: string, w: number, h: number, credit: string }} entry
 */
export function unsplashSrc(entry) {
  return `https://images.unsplash.com/${entry.id}?auto=format&fit=crop&w=${entry.w}&h=${entry.h}&q=85`;
}

/**
 * @param {{ id: string }} entry
 */
export function unsplashPageUrl(entry) {
  const slug = entry.id.replace(/^photo-/, "");
  return `https://unsplash.com/photos/${slug}`;
}
