// @ts-nocheck

const originalSupports = CSS.supports.bind(CSS);
Object.defineProperty(CSS, "supports", {
  configurable: true,
  value: (...args) => {
    if (args.join(" ").includes("grid-lanes")) {
      return false;
    }
    return Reflect.apply(originalSupports, CSS, args);
  },
});

const { mountRuntimeNotice } = await import("./init-demo.js");
const { adoptMasonryGridLanesStyles, defineMasonryGridLanes } = await import("/src/index.js");
const { loadRowPlan, renderMixedPlan } = await import("./mixed-content.js");

defineMasonryGridLanes();
await adoptMasonryGridLanesStyles(document);
mountRuntimeNotice({ supportsNative: false });
if (document.fonts?.ready != null) {
  await document.fonts.ready;
}

const grid = document.querySelector("masonry-grid-lanes");
const status = document.getElementById("status");
if (!grid || !status) throw new Error("demo DOM");

status.textContent = "Loading row lanes…";
const { plan, statusText } = await loadRowPlan();
renderMixedPlan(grid, plan);
status.textContent = `${statusText} · horizontal scroll recommended`;
