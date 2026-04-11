/**
 * Pretext needs a 2D canvas measure context; happy-dom often returns null from getContext("2d").
 * Minimal polyfill so unit tests can run under `vp test` + happy-dom.
 */
function installOffscreenCanvasPolyfill() {
  const makeCtx = () => {
    return {
      /** @type {string} */
      font: "",
      /**
       * @param {string} s
       */
      measureText(s: string) {
        const seg = new Intl.Segmenter("en", { granularity: "grapheme" });
        const w = Math.max(1, [...seg.segment(s)].length * 6);
        return {
          width: w,
          actualBoundingBoxAscent: 10,
          actualBoundingBoxDescent: 3,
        };
      },
    };
  };

  class PolyOffscreenCanvas {
    constructor(w: number, h: number) {
      void w;
      void h;
    }

    /**
     * @param {string} type
     */
    getContext(type: string) {
      return type === "2d" ? makeCtx() : null;
    }
  }

  const needsPolyfill = (() => {
    if (typeof globalThis.OffscreenCanvas !== "function") return true;
    try {
      const c = new globalThis.OffscreenCanvas(1, 1);
      return c.getContext("2d") == null;
    } catch {
      return true;
    }
  })();

  if (needsPolyfill) {
    Object.defineProperty(globalThis, "OffscreenCanvas", {
      value: PolyOffscreenCanvas,
      configurable: true,
      writable: true,
    });
  }
}

installOffscreenCanvasPolyfill();
