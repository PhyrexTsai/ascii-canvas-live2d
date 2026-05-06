import { AsciiCanvasLive2dElement } from "./element.js";

export { AsciiCanvasLive2dElement } from "./element.js";

if (!customElements.get("ascii-canvas-live2d")) {
  customElements.define("ascii-canvas-live2d", AsciiCanvasLive2dElement);
}

declare global {
  interface HTMLElementTagNameMap {
    "ascii-canvas-live2d": AsciiCanvasLive2dElement;
  }
}
