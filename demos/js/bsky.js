// @ts-nocheck

const PUBLIC_API = "https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed";

/**
 * @param {string} actor handle or DID
 * @param {number} [limit]
 */
export async function fetchAuthorFeed(actor, limit = 45) {
  const u = new URL(PUBLIC_API);
  u.searchParams.set("actor", actor);
  u.searchParams.set("limit", String(limit));
  const res = await fetch(u);
  if (!res.ok) {
    throw new Error(`Bluesky feed failed (${res.status})`);
  }
  return res.json();
}

/**
 * @param {unknown} postView feed item (wrapped post)
 * @returns {string}
 */
export function getPostText(postView) {
  const t = postView?.post?.record?.text;
  return typeof t === "string" ? t.trim() : "";
}

/**
 * Thumbnail URL from hydrated embed view (external, images, video).
 * @param {unknown} postView
 * @returns {string | null}
 */
export function getEmbedThumbUrl(postView) {
  const e = postView?.post?.embed;
  if (!e || typeof e !== "object") return null;
  const t = /** @type {{ $type?: string }} */ (e).$type;
  if (t === "app.bsky.embed.external#view") {
    const thumb = /** @type {{ external?: { thumb?: string } }} */ (e).external?.thumb;
    return typeof thumb === "string" ? thumb : null;
  }
  if (t === "app.bsky.embed.images#view") {
    const img = /** @type {{ images?: { thumb?: string }[] }} */ (e).images?.[0];
    const thumb = img?.thumb;
    return typeof thumb === "string" ? thumb : null;
  }
  if (t === "app.bsky.embed.video#view") {
    const thumb = /** @type {{ thumbnail?: string }} */ (e).thumbnail;
    return typeof thumb === "string" ? thumb : null;
  }
  return null;
}
