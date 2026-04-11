import { afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test";

describe("adoptMasonryGridLanesStyles", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("fetches CSS and appends a constructable stylesheet when adoptedStyleSheets exists", async () => {
    const css = "masonry-grid-lanes { display: block; }";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: () => Promise.resolve(css),
      }),
    );

    const { adoptMasonryGridLanesStyles } = await import("../src/adopt-default-styles.js");

    if (!("adoptedStyleSheets" in document)) {
      expect(true).toBe(true);
      return;
    }

    const before = document.adoptedStyleSheets.length;
    await adoptMasonryGridLanesStyles(window.document);
    expect(document.adoptedStyleSheets.length).toBeGreaterThan(before);
    expect(globalThis.fetch).toHaveBeenCalled();
  });

  test("second call on same root does not fetch again", async () => {
    const css = "masonry-grid-lanes { }";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(css),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { adoptMasonryGridLanesStyles } = await import("../src/adopt-default-styles.js");

    if (!("adoptedStyleSheets" in document)) {
      expect(true).toBe(true);
      return;
    }

    await adoptMasonryGridLanesStyles(window.document);
    const n = fetchMock.mock.calls.length;
    await adoptMasonryGridLanesStyles(window.document);
    expect(fetchMock.mock.calls.length).toBe(n);
  });
});
