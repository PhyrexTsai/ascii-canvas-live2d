import "../src/index.ts";
import type { AsciiCanvasLive2dElement } from "../src/element.ts";
import type { Live2DModel } from "pixi-live2d-display/cubism4";

const stage = document.getElementById("stage") as AsciiCanvasLive2dElement;
const fpsEl = document.getElementById("fps") as HTMLSpanElement;
const sizeEl = document.getElementById("size") as HTMLSpanElement;
const rampEl = document.getElementById("ramp") as HTMLSelectElement;
const zoomEl = document.getElementById("zoom") as HTMLInputElement;
const zoomValEl = document.getElementById("zoom-val") as HTMLSpanElement;
const yoffsetEl = document.getElementById("yoffset") as HTMLInputElement;
const yoffsetValEl = document.getElementById("yoffset-val") as HTMLSpanElement;
const cellEl = document.getElementById("cell") as HTMLInputElement;
const cellValEl = document.getElementById("cell-val") as HTMLSpanElement;
const motionGroupEl = document.getElementById(
  "motion-group",
) as HTMLSelectElement;
const motionPlayEl = document.getElementById(
  "motion-play",
) as HTMLButtonElement;
const expressionEl = document.getElementById(
  "expression",
) as HTMLSelectElement;

rampEl.addEventListener("change", () => {
  stage.setAttribute("ramp", rampEl.value);
});

zoomEl.addEventListener("input", () => {
  stage.setAttribute("zoom", zoomEl.value);
  zoomValEl.textContent = `${parseFloat(zoomEl.value).toFixed(1)}×`;
});

yoffsetEl.addEventListener("input", () => {
  stage.setAttribute("y-offset", yoffsetEl.value);
  yoffsetValEl.textContent = parseFloat(yoffsetEl.value).toFixed(2);
});

cellEl.addEventListener("input", () => {
  const w = parseInt(cellEl.value, 10);
  const h = Math.round(w * 1.75);
  stage.setAttribute("cell-w", String(w));
  stage.setAttribute("cell-h", String(h));
  stage.setAttribute("font-px", String(Math.max(8, w + 4)));
  cellValEl.textContent = `${w} × ${h}`;
});

let frames = 0;
let lastSecond = performance.now();
function fpsTick() {
  frames++;
  const now = performance.now();
  if (now - lastSecond >= 1000) {
    fpsEl.textContent = `${frames} fps`;
    frames = 0;
    lastSecond = now;
  }
  requestAnimationFrame(fpsTick);
}
requestAnimationFrame(fpsTick);

const reportSize = () => {
  const rect = stage.getBoundingClientRect();
  sizeEl.textContent = `${Math.round(rect.width)} × ${Math.round(rect.height)} px`;
};
reportSize();
new ResizeObserver(reportSize).observe(stage);

interface MotionDefinitions {
  [group: string]: { Name?: string; File: string }[] | undefined;
}
interface ExpressionDefinition {
  Name: string;
  File: string;
}

let currentModel: Live2DModel | null = null;

stage.addEventListener("model-loaded", (e) => {
  const model = (e as CustomEvent<{ model: Live2DModel }>).detail.model;
  currentModel = model;

  const motionDefs = model.internalModel.motionManager
    .definitions as MotionDefinitions;
  motionGroupEl.innerHTML = "";
  for (const group of Object.keys(motionDefs)) {
    const opt = document.createElement("option");
    opt.value = group;
    opt.textContent = `${group} (${motionDefs[group]?.length ?? 0})`;
    motionGroupEl.appendChild(opt);
  }
  motionGroupEl.disabled = motionGroupEl.options.length === 0;
  motionPlayEl.disabled = motionGroupEl.disabled;

  expressionEl.innerHTML = '<option value="">none</option>';
  const expManager = model.internalModel.motionManager.expressionManager;
  const expDefs = (expManager?.definitions ?? []) as ExpressionDefinition[];
  for (const def of expDefs) {
    const opt = document.createElement("option");
    opt.value = def.Name;
    opt.textContent = def.Name;
    expressionEl.appendChild(opt);
  }
  expressionEl.disabled = expDefs.length === 0;
});

motionPlayEl.addEventListener("click", () => {
  if (!currentModel) return;
  const group = motionGroupEl.value;
  if (!group) return;
  void currentModel.motion(group);
});

expressionEl.addEventListener("change", () => {
  if (!currentModel) return;
  const name = expressionEl.value;
  void currentModel.expression(name === "" ? undefined : name);
});
