import { defineConfig } from "vite-plus";

export default defineConfig({
  server: {
    host: "127.0.0.1",
  },
  preview: {
    host: "127.0.0.1",
  },
  staged: {
    "{src,tests,e2e,demos}/**/*.{js,ts}":
      "vp check --fix src tests e2e demos playwright.config.ts vite.config.ts package.json tsconfig.json",
    "vite.config.ts":
      "vp check --fix src tests e2e demos playwright.config.ts vite.config.ts package.json tsconfig.json",
    "package.json":
      "vp check --fix src tests e2e demos playwright.config.ts vite.config.ts package.json tsconfig.json",
    "tsconfig.json":
      "vp check --fix src tests e2e demos playwright.config.ts vite.config.ts package.json tsconfig.json",
    "playwright.config.ts":
      "vp check --fix src tests e2e demos playwright.config.ts vite.config.ts package.json tsconfig.json",
  },
  pack: {
    entry: ["src/index.js", "src/pretext-entry.js", "src/headless.js"],
    copy: [{ from: "src/masonry-grid-lanes.css" }],
    dts: {
      tsgo: true,
    },
    exports: true,
  },
  build: {
    outDir: "dist-demo",
    rollupOptions: {
      input: {
        demos: "demos/index.html",
        images: "demos/images.html",
        blueskyText: "demos/bluesky-text.html",
        blueskyCards: "demos/bluesky-cards.html",
        mixed: "demos/mixed.html",
        rows: "demos/rows.html",
        referenceSwitch: "demos/reference-switch.html",
        playground: "demos/playground.html",
      },
    },
  },
  test: {
    environment: "happy-dom",
    setupFiles: ["./tests/setup-polyfill.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/e2e/**"],
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
});
