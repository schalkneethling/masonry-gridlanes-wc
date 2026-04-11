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

defineMasonryGridLanes();
await adoptMasonryGridLanesStyles(document);
mountRuntimeNotice({ supportsNative: false });

const grid = document.getElementById("switcher-grid");
const shell = grid?.closest?.(".demo-grid-shell");
const colButton = document.getElementById("switch-col");
const rowButton = document.getElementById("switch-row");
const desc = document.getElementById("switcher-desc");
const badgePrimary = document.getElementById("switcher-badge-primary");
const badgeSecondary = document.getElementById("switcher-badge-secondary");

if (
  !(grid instanceof HTMLElement) ||
  !(shell instanceof HTMLElement) ||
  !(colButton instanceof HTMLButtonElement) ||
  !(rowButton instanceof HTMLButtonElement) ||
  !(desc instanceof HTMLElement) ||
  !(badgePrimary instanceof HTMLElement) ||
  !(badgeSecondary instanceof HTMLElement)
) {
  throw new Error("switcher DOM");
}

const colors = [
  { bg: "#eeedfe", text: "#3c3489" },
  { bg: "#e1f5ee", text: "#085041" },
  { bg: "#fbeaf0", text: "#72243e" },
  { bg: "#e6f1fb", text: "#0c447c" },
  { bg: "#faeeda", text: "#633806" },
  { bg: "#eaf3de", text: "#27500a" },
  { bg: "#faece7", text: "#712b13" },
  { bg: "#f1efe8", text: "#444441" },
  { bg: "#eeedfe", text: "#3c3489" },
];

const items = [
  { label: "A", size: 2 },
  { label: "B", size: 3 },
  { label: "C", size: 1 },
  { label: "D", size: 2 },
  { label: "E", size: 1 },
  { label: "F", size: 3 },
  { label: "G", size: 1 },
  { label: "H", size: 2 },
  { label: "I", size: 3 },
];

for (const [index, item] of items.entries()) {
  const card = document.createElement("article");
  card.className = "demo-switcher-card";
  card.dataset.label = item.label;
  card.textContent = item.label;
  card.setAttribute("aria-label", `Reference item ${item.label}`);
  card.style.setProperty("--switcher-bg", colors[index]?.bg ?? "#f1efe8");
  card.style.setProperty("--switcher-ink", colors[index]?.text ?? "#444441");
  grid.appendChild(card);
}

function update(mode) {
  const cards = Array.from(grid.children);
  const isRow = mode === "row";

  grid.setAttribute("gap", "20");
  grid.style.height = "340px";
  grid.style.maxWidth = isRow ? "none" : "1120px";
  shell.dataset.rowActive = String(isRow);

  if (isRow) {
    grid.setAttribute("mode", "rows");
    grid.setAttribute("row-count", "3");
    grid.removeAttribute("min-column-width");
    grid.setAttribute("min-row-height", "100");
    desc.innerHTML =
      "<strong>Rows are fixed, columns pack tight.</strong> Items flow into the shortest row, eliminating horizontal gaps.";
    badgePrimary.textContent = 'row-count="3"';
    badgeSecondary.textContent = 'mode="rows"';
  } else {
    grid.removeAttribute("mode");
    grid.removeAttribute("row-count");
    grid.removeAttribute("min-row-height");
    grid.setAttribute("min-column-width", "320");
    desc.innerHTML =
      "<strong>Columns are fixed, rows pack tight.</strong> Items flow into the shortest column, eliminating the gaps you would get with a regular grid.";
    badgePrimary.textContent = 'min-column-width="320"';
    badgeSecondary.textContent = 'mode="columns"';
  }

  for (const [index, card] of cards.entries()) {
    if (!(card instanceof HTMLElement)) continue;
    const size = items[index]?.size ?? 1;
    card.style.width = isRow ? `${size * 190}px` : "";
    card.style.height = isRow ? "100px" : `${size * 100}px`;
  }

  colButton.classList.toggle("is-active", !isRow);
  rowButton.classList.toggle("is-active", isRow);
  colButton.setAttribute("aria-selected", String(!isRow));
  rowButton.setAttribute("aria-selected", String(isRow));
}

colButton.addEventListener("click", () => update("col"));
rowButton.addEventListener("click", () => update("row"));

update("col");
