// @ts-nocheck

import { initDemo } from "./init-demo.js";
import { loadBalancedFlowPlan, loadMixedPlan, renderMixedPlan } from "./mixed-content.js";

await initDemo();

const grid = document.getElementById("playground-grid");
const status = document.getElementById("status");
const form = document.getElementById("playground-controls");
const attrsSummary = document.getElementById("playground-attrs");
const scopeNote = document.getElementById("playground-scope-note");
const datasetInput = document.getElementById("dataset-input");
const datasetValue = document.getElementById("dataset-value");

if (!(grid instanceof HTMLElement) || !(status instanceof HTMLElement)) {
  throw new Error("demo DOM");
}
if (!(form instanceof HTMLFormElement) || !(attrsSummary instanceof HTMLElement)) {
  throw new Error("demo controls");
}
if (!(scopeNote instanceof HTMLElement)) {
  throw new Error("demo scope note");
}
if (!(datasetInput instanceof HTMLSelectElement) || !(datasetValue instanceof HTMLOutputElement)) {
  throw new Error("demo dataset");
}

status.textContent = "Loading mixed wall…";

const datasets = {
  mixed: await loadMixedPlan(),
  balanced: loadBalancedFlowPlan(),
};

/**
 * @param {"mixed" | "balanced"} key
 */
function renderDataset(key) {
  const next = datasets[key];
  if (!next) {
    return;
  }
  renderMixedPlan(grid, next.plan);
  datasetValue.textContent = key === "balanced" ? "balanced cards" : "mixed wall";
  status.textContent = `${next.statusText} · Live controls ready`;
}

renderDataset("mixed");

/** @type {{ name: string, input: string, output: string, unit: string }[]} */
const controlDefs = [
  { name: "gap", input: "gap-input", output: "gap-value", unit: "px" },
  {
    name: "min-column-width",
    input: "min-column-width-input",
    output: "min-column-width-value",
    unit: "px",
  },
  {
    name: "flow-tolerance",
    input: "flow-tolerance-input",
    output: "flow-tolerance-value",
    unit: "px",
  },
  { name: "text-metrics", input: "text-metrics-input", output: "text-metrics-value", unit: "" },
];

/**
 * @param {HTMLInputElement | HTMLSelectElement} input
 * @param {HTMLElement} output
 * @param {string} unit
 */
function syncOutput(input, output, unit) {
  output.textContent = unit ? `${input.value}${unit}` : input.value;
}

function applyControls() {
  /** @type {string[]} */
  const parts = [];
  const requestedDataset = datasetInput.value === "balanced" ? "balanced" : "mixed";
  const activeDataset = requestedDataset;

  renderDataset(activeDataset);

  for (const def of controlDefs) {
    const input = document.getElementById(def.input);
    const output = document.getElementById(def.output);
    const enabled = form.elements.namedItem(`${def.name}-enabled`);

    if (
      !(input instanceof HTMLInputElement || input instanceof HTMLSelectElement) ||
      !(output instanceof HTMLOutputElement) ||
      !(enabled instanceof HTMLInputElement)
    ) {
      continue;
    }

    enabled.disabled = false;
    input.disabled = !enabled.checked;
    syncOutput(input, output, def.unit);

    if (enabled.checked) {
      grid.setAttribute(def.name, input.value);
      parts.push(`${def.name}="${input.value}"`);
    } else {
      grid.removeAttribute(def.name);
    }
  }

  attrsSummary.textContent = parts.length > 0 ? parts.join(" ") : "No custom attributes applied";
  scopeNote.textContent =
    activeDataset === "balanced"
      ? "`min-column-width` is active, row-mode controls are intentionally absent here, and the balanced cards dataset makes `flow-tolerance` threshold changes easier to observe."
      : "`min-column-width` is active, this playground is intentionally column-first, and row mode is currently documented as experimental elsewhere.";
}

form.addEventListener("input", applyControls);
form.addEventListener("change", applyControls);
datasetInput.addEventListener("input", applyControls);
datasetInput.addEventListener("change", applyControls);

applyControls();
