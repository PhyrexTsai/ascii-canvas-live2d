import * as PIXI from "pixi.js";
import { Live2DModel } from "pixi-live2d-display/cubism4";
import "@phyrex/ascii-canvas";

(window as unknown as { PIXI: typeof PIXI }).PIXI = PIXI;
Live2DModel.registerTicker(PIXI.Ticker);

const ASCII_ATTRS = [
  "ramp",
  "cell-w",
  "cell-h",
  "font-px",
  "alpha-threshold",
  "paused",
] as const;

const OWN_ATTRS = [
  "model-url",
  "zoom",
  "x-offset",
  "y-offset",
  "floating-zoom",
  "floating-x-offset",
  "floating-y-offset",
] as const;

type Mode = "hero" | "floating";

interface AsciiCanvasSourceTarget extends HTMLElement {
  source: CanvasImageSource | null;
}

export class AsciiCanvasLive2dElement extends HTMLElement {
  static readonly observedAttributes: readonly string[] = [
    ...ASCII_ATTRS,
    ...OWN_ATTRS,
  ];

  #shadow: ShadowRoot;
  #hiddenCanvas: HTMLCanvasElement;
  #ascii: AsciiCanvasSourceTarget;
  #app: PIXI.Application | null = null;
  #model: Live2DModel | null = null;
  #loadToken = 0;
  #baseW = 1;
  #baseH = 1;
  #fitScale = 1;
  #mode: Mode = "hero";
  #resizeObs: ResizeObserver;
  #connected = false;

  constructor() {
    super();
    this.#shadow = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = `
      :host { display: block; position: relative; }
      canvas[data-hidden] {
        position: absolute;
        left: -99999px;
        top: 0;
        pointer-events: none;
      }
      ascii-canvas {
        display: block;
        width: 100%;
        height: 100%;
      }
    `;
    this.#shadow.appendChild(style);

    this.#hiddenCanvas = document.createElement("canvas");
    this.#hiddenCanvas.dataset.hidden = "";
    this.#shadow.appendChild(this.#hiddenCanvas);

    this.#ascii = document.createElement(
      "ascii-canvas",
    ) as AsciiCanvasSourceTarget;
    this.#shadow.appendChild(this.#ascii);

    this.#resizeObs = new ResizeObserver(() => this.#resize());
  }

  connectedCallback(): void {
    this.#connected = true;

    for (const a of ASCII_ATTRS) {
      const v = this.getAttribute(a);
      if (v !== null) this.#ascii.setAttribute(a, v);
    }

    this.#resize();
    this.#resizeObs.observe(this);

    void this.#load();
  }

  disconnectedCallback(): void {
    this.#connected = false;
    this.#resizeObs.disconnect();
    this.#ascii.source = null;
    if (this.#app) {
      this.#app.destroy(true);
      this.#app = null;
    }
    this.#model = null;
  }

  attributeChangedCallback(
    name: string,
    _old: string | null,
    val: string | null,
  ): void {
    if (!this.#connected) return;

    if ((ASCII_ATTRS as readonly string[]).includes(name)) {
      if (val === null) this.#ascii.removeAttribute(name);
      else this.#ascii.setAttribute(name, val);
      return;
    }

    if (name === "model-url") {
      void this.#load();
      return;
    }

    this.#applyView();
  }

  setMode(mode: Mode): void {
    if (mode !== "hero" && mode !== "floating") return;
    this.#mode = mode;
    this.#applyView();
  }

  setHeroAlpha(alpha: number): void {
    const a = Math.max(0, Math.min(1, Number(alpha) || 0));
    this.style.opacity = String(a);
  }

  /**
   * The underlying Live2DModel instance, or null if no model is loaded yet.
   *
   * Use this to drive motions, expressions, hit areas, or lip-sync directly
   * via `pixi-live2d-display` — those high-level features are intentionally
   * not surfaced on this element. Listen for the `model-loaded` event if you
   * need to know when this becomes available.
   */
  get model(): Live2DModel | null {
    return this.#model;
  }

  async #load(): Promise<void> {
    const url = this.getAttribute("model-url");
    if (!url) return;

    const token = ++this.#loadToken;

    if (this.#app) {
      this.#app.destroy(true);
      this.#app = null;
    }
    this.#model = null;
    this.#ascii.source = null;

    const { w, h } = this.#measure();

    const app = new PIXI.Application({
      view: this.#hiddenCanvas,
      width: w,
      height: h,
      backgroundAlpha: 0,
      antialias: true,
      preserveDrawingBuffer: true,
      resolution: 1,
    });
    this.#app = app;

    const model = await Live2DModel.from(url);
    if (token !== this.#loadToken) {
      // Superseded by a newer load; bail without touching state.
      return;
    }

    app.stage.addChild(model as unknown as PIXI.DisplayObject);
    model.scale.set(1);
    this.#baseW = model.width;
    this.#baseH = model.height;
    this.#model = model;

    this.#resize();
    this.#ascii.source = this.#hiddenCanvas;

    this.dispatchEvent(
      new CustomEvent<{ model: Live2DModel }>("model-loaded", {
        detail: { model },
      }),
    );
  }

  #measure(): { w: number; h: number } {
    const rect = this.getBoundingClientRect();
    return {
      w: Math.max(1, Math.floor(rect.width)),
      h: Math.max(1, Math.floor(rect.height)),
    };
  }

  #resize(): void {
    const { w, h } = this.#measure();

    this.#hiddenCanvas.width = w;
    this.#hiddenCanvas.height = h;

    if (this.#app) this.#app.renderer.resize(w, h);

    if (this.#model) {
      this.#fitScale = Math.min(w / this.#baseW, h / this.#baseH);
      this.#applyView();
    }
  }

  #applyView(): void {
    if (!this.#model) return;

    const prefix = this.#mode === "floating" ? "floating-" : "";
    const zoom = readFloat(this, `${prefix}zoom`, 1);
    const xRatio = readFloat(this, `${prefix}x-offset`, 0);
    const yRatio = readFloat(this, `${prefix}y-offset`, 0);

    const w = this.#hiddenCanvas.width;
    const h = this.#hiddenCanvas.height;

    const s = this.#fitScale * zoom;
    this.#model.scale.set(s);
    this.#model.x = (w - this.#model.width) / 2 + w * xRatio;
    this.#model.y = h * yRatio;
  }
}

function readFloat(el: HTMLElement, name: string, fallback: number): number {
  const v = el.getAttribute(name);
  if (v === null) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
