// @ts-check

/**
 * @typedef {"columns" | "rows"} GridLanesOrientation
 * @typedef {{ kind: "auto" } | { kind: "span", value: number } | { kind: "line", value: number }} PlacementToken
 * @typedef {{
 *   index: number,
 *   order?: number,
 *   start?: number | null,
 *   span?: number,
 *   size: number,
 *   crossSize?: number,
 * }} GridLanesItemInput
 * @typedef {{
 *   index: number,
 *   order: number,
 *   start: number | null,
 *   span: number,
 *   size: number,
 *   crossSize: number,
 * }} NormalizedGridLanesItem
 * @typedef {{
 *   top: number,
 *   left: number,
 *   width: number,
 *   height?: number,
 *   track: number,
 *   span: number,
 *   index: number,
 * }} PlacedGridLanesItem
 * @typedef {{
 *   orientation: GridLanesOrientation,
 *   trackCount: number,
 *   containerSize: number,
 *   gap: number,
 *   flowTolerance?: number,
 *   items: GridLanesItemInput[],
 * }} GridLanesLayoutOptions
 * @typedef {{
 *   orientation: GridLanesOrientation,
 *   trackCount: number,
 *   trackSize: number,
 *   extent: number,
 *   positions: PlacedGridLanesItem[],
 * }} GridLanesLayoutResult
 */

/**
 * @param {number} trackCount
 * @param {number} containerSize
 * @param {number} gap
 * @returns {number}
 */
function trackSizeFromContainer(trackCount, containerSize, gap) {
  const n = Math.max(1, Math.floor(trackCount));
  const g = Math.max(0, gap);
  const usable = Math.max(0, containerSize - g * (n - 1));
  return usable / n;
}

/**
 * @param {GridLanesItemInput} item
 * @returns {NormalizedGridLanesItem}
 */
function normalizeItem(item) {
  return {
    index: item.index,
    order: Number.isFinite(item.order) ? Number(item.order) : 0,
    start: item.start ?? null,
    span: Math.max(1, Math.floor(item.span ?? 1)),
    size: Math.max(0, item.size),
    crossSize: Math.max(0, item.crossSize ?? 0),
  };
}

/**
 * @param {NormalizedGridLanesItem[]} items
 * @returns {NormalizedGridLanesItem[]}
 */
function sortItems(items) {
  return [...items].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.index - b.index;
  });
}

/**
 * @param {number} start
 * @param {number} span
 * @param {number} trackCount
 * @returns {number}
 */
function clampTrackStart(start, span, trackCount) {
  const maxStart = Math.max(0, trackCount - span);
  return Math.min(Math.max(0, start), maxStart);
}

/**
 * @param {number[]} trackEnds
 * @param {number} start
 * @param {number} span
 * @returns {number}
 */
function laneEndForSpan(trackEnds, start, span) {
  let maxEnd = 0;
  for (let index = start; index < start + span; index += 1) {
    maxEnd = Math.max(maxEnd, trackEnds[index] ?? 0);
  }
  return maxEnd;
}

/**
 * @param {number[]} trackEnds
 * @param {number} start
 * @param {number} span
 * @param {number} nextEnd
 */
function updateTrackEnds(trackEnds, start, span, nextEnd) {
  for (let index = start; index < start + span; index += 1) {
    trackEnds[index] = nextEnd;
  }
}

/**
 * @param {number[]} trackEnds
 * @param {number} span
 * @param {number} tolerance
 * @returns {{ start: number, end: number }}
 */
function pickAutoStart(trackEnds, span, tolerance) {
  /** @type {{ start: number, end: number }[]} */
  const candidates = [];
  for (let start = 0; start <= trackEnds.length - span; start += 1) {
    candidates.push({ start, end: laneEndForSpan(trackEnds, start, span) });
  }

  let minEnd = candidates[0]?.end ?? 0;
  for (const candidate of candidates) {
    minEnd = Math.min(minEnd, candidate.end);
  }

  const threshold = minEnd + Math.max(0, tolerance);
  for (const candidate of candidates) {
    if (candidate.end <= threshold) {
      return candidate;
    }
  }

  return candidates[0] ?? { start: 0, end: 0 };
}

/**
 * Pure grid-lanes fallback layout. The algorithm is intentionally spec-shaped:
 * grid-axis tracks are fixed, auto-placed items choose the shortest eligible lane,
 * and `flow-tolerance` turns near-ties into "stay in reading order" decisions.
 *
 * @param {GridLanesLayoutOptions} options
 * @returns {GridLanesLayoutResult}
 */
export function layoutGridLanes(options) {
  const trackCount = Math.max(1, Math.floor(options.trackCount));
  const gap = Math.max(0, options.gap);
  const trackSize = trackSizeFromContainer(trackCount, options.containerSize, gap);
  const tolerance = Math.max(0, options.flowTolerance ?? 0);
  const trackEnds = Array.from({ length: trackCount }, () => 0);
  /** @type {PlacedGridLanesItem[]} */
  const positions = Array.from({ length: options.items.length });
  const items = sortItems(options.items.map(normalizeItem));

  for (const item of items) {
    const span = Math.min(trackCount, Math.max(1, item.span));
    const explicitStart = item.start == null ? null : clampTrackStart(item.start, span, trackCount);
    const candidate =
      explicitStart == null
        ? pickAutoStart(trackEnds, span, tolerance)
        : { start: explicitStart, end: laneEndForSpan(trackEnds, explicitStart, span) };
    const nextEnd = candidate.end + item.size + gap;

    if (options.orientation === "columns") {
      positions[item.index] = {
        index: item.index,
        track: candidate.start,
        span,
        top: candidate.end,
        left: candidate.start * (trackSize + gap),
        width: span * trackSize + gap * (span - 1),
      };
    } else {
      positions[item.index] = {
        index: item.index,
        track: candidate.start,
        span,
        top: candidate.start * (trackSize + gap),
        left: candidate.end,
        width: item.size,
        height: item.crossSize,
      };
    }

    updateTrackEnds(trackEnds, candidate.start, span, nextEnd);
  }

  const maxEnd = trackEnds.length > 0 ? Math.max(...trackEnds) : 0;
  return {
    orientation: options.orientation,
    trackCount,
    trackSize,
    extent: Math.max(0, maxEnd - gap),
    positions,
  };
}

/**
 * @param {string} value
 * @returns {PlacementToken}
 */
export function parsePlacementToken(value) {
  const trimmed = value.trim();
  if (trimmed === "" || trimmed === "auto") {
    return { kind: "auto" };
  }

  const spanMatch = /^span\s+(-?\d+)$/i.exec(trimmed);
  if (spanMatch) {
    return { kind: "span", value: Number.parseInt(spanMatch[1] ?? "1", 10) };
  }

  const line = Number.parseInt(trimmed, 10);
  if (Number.isFinite(line)) {
    return { kind: "line", value: line };
  }

  return { kind: "auto" };
}

/**
 * CSS grid line numbers are 1-based, and negative values count backward from the end line.
 *
 * @param {number} line
 * @param {number} trackCount
 * @returns {number | null}
 */
function resolveLine(line, trackCount) {
  if (!Number.isFinite(line) || line === 0) {
    return null;
  }
  if (line > 0) {
    return line;
  }
  return trackCount + 2 + line;
}

/**
 * Resolves `grid-column-start/end` or `grid-row-start/end` into a fallback track start + span.
 *
 * @param {string} startValue
 * @param {string} endValue
 * @param {number} trackCount
 * @returns {{ start: number | null, span: number }}
 */
export function resolveGridAxisPlacement(startValue, endValue, trackCount) {
  const startToken = parsePlacementToken(startValue);
  const endToken = parsePlacementToken(endValue);
  let span = 1;
  let startLine = null;
  let endLine = null;

  if (startToken.kind === "span") {
    span = Math.max(1, startToken.value);
  } else if (startToken.kind === "line") {
    startLine = resolveLine(startToken.value, trackCount);
  }

  if (endToken.kind === "span") {
    span = Math.max(1, endToken.value);
  } else if (endToken.kind === "line") {
    endLine = resolveLine(endToken.value, trackCount);
  }

  if (startLine != null && endLine != null) {
    span = Math.max(1, endLine - startLine);
  } else if (startLine == null && endLine != null) {
    startLine = endLine - span;
  }

  const start =
    startLine == null ? null : clampTrackStart(Math.max(1, startLine) - 1, span, trackCount);

  return {
    start,
    span: Math.min(trackCount, Math.max(1, span)),
  };
}
