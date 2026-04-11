// @ts-nocheck

import { initDemo } from "./init-demo.js";
import { loadMixedPlan, renderMixedPlan } from "./mixed-content.js";

await initDemo();

const grid = document.querySelector("masonry-grid-lanes");
const status = document.getElementById("status");
if (!grid || !status) throw new Error("demo DOM");

status.textContent = "Loading…";
const { plan, statusText } = await loadMixedPlan();
renderMixedPlan(grid, plan);
status.textContent = statusText;
