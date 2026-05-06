# @phyrextsai/ascii-canvas-live2d

> Drop-in Web Component that renders **any Live2D model as live ASCII art** in the browser.

**Status: WIP — not yet published to npm.** See [tasks.md](./tasks.md) for roadmap.

Built on [`@phyrex/ascii-canvas`](https://www.npmjs.com/package/@phyrex/ascii-canvas) (the ASCII renderer) + [`pixi-live2d-display`](https://github.com/guansss/pixi-live2d-display) (Live2D runtime). The browser-side combination of Live2D and ASCII rendering does not exist elsewhere as a published library — this is the first.

```text
   .model3.json       hidden <canvas>          <ascii-canvas-live2d>
   ┌────────────┐     ┌──────────────┐         ┌────────────────────┐
   │ moc3       │ ──► │ PIXI app     │ ──────► │ "@@%###*+=-:.  "   │
   │ textures   │     │ Live2DModel  │ source  │   (your model in   │
   │ motions    │     │ (off-screen) │         │    ASCII chars)    │
   └────────────┘     └──────────────┘         └────────────────────┘
```

---

## Quick start

### Install

```sh
npm install @phyrextsai/ascii-canvas-live2d pixi.js@^6 pixi-live2d-display@^0.4
```

`pixi.js` and `pixi-live2d-display` are **peer dependencies** — you install them so multiple consumers don't end up with conflicting copies (especially important if you also use Live2D elsewhere in the same app).

### Use

```html
<!doctype html>
<html>
  <head>
    <!-- Live2D Cubism Core: loaded from Live2D's CDN per their license.
         Do not bundle or self-host. -->
    <script src="https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js"></script>
  </head>
  <body>
    <ascii-canvas-live2d
      model-url="/my-character/Character.model3.json"
      zoom="2"
      y-offset="-0.1"
      cell-w="7"
      cell-h="12"
      style="width: 800px; aspect-ratio: 2/1;">
    </ascii-canvas-live2d>

    <script type="module">
      // Side-effect import — registers <ascii-canvas-live2d> and <ascii-canvas>
      // automatically. No setup function to call.
      import "@phyrextsai/ascii-canvas-live2d";
    </script>
  </body>
</html>
```

That's it. Works in any framework (React, Vue, Svelte, vanilla, …) because it's a Custom Element.

### Bring your own model

Drop a standard Cubism 4 model directory anywhere your app can serve it:

```
my-character/
├── Character.model3.json    ← point model-url at this
├── Character.moc3
├── Character.physics3.json
├── textures/texture_00.png
├── motions/idle.motion3.json
└── expressions/happy.exp3.json
```

Paths inside `model3.json` are relative — the lib doesn't touch that layer; loading is delegated to `pixi-live2d-display`.

---

## API

### Element: `<ascii-canvas-live2d>`

Set a CSS size on the host. The ASCII grid is computed from `width / cell-w` × `height / cell-h`.

#### Attributes

| Attribute | Default | Description |
|---|---|---|
| `model-url` | (required) | URL of the `.model3.json` file. Changing this hot-swaps the model (older loads cancel safely). |
| `zoom` | `1` | Multiplier on the auto-fit scale. Hero mode. |
| `x-offset` | `0` | Horizontal offset as a fraction of stage width (`0.1` = +10% right). Hero mode. |
| `y-offset` | `0` | Vertical offset as a fraction of stage height. Hero mode. |
| `floating-zoom` / `floating-x-offset` / `floating-y-offset` | `1` / `0` / `0` | Same, used when `setMode("floating")` is active. |
| `ramp` | `" .:-=+*#%@"` | Forwarded to nested `<ascii-canvas>`. Character set ordered dark→bright. |
| `cell-w` | `8` | Forwarded. Grid cell width in CSS pixels. |
| `cell-h` | `14` | Forwarded. Grid cell height. |
| `font-px` | `12` | Forwarded. Output font size. |
| `alpha-threshold` | `16` | Forwarded. Skip cells below this alpha (0–255). |
| `paused` | absent | Forwarded. When present, freezes ASCII output. |

All attributes are reactive — set them via JS at any time:

```js
const stage = document.querySelector("ascii-canvas-live2d");
stage.setAttribute("model-url", "/another/Other.model3.json"); // hot-swap
stage.setAttribute("zoom", "3");
stage.setAttribute("ramp", " ░▒▓█");
```

#### Methods

| Method | Description |
|---|---|
| `setMode("hero" \| "floating")` | Switch which set of zoom / x-offset / y-offset values is active. |
| `setHeroAlpha(0..1)` | Sets host opacity. Useful for fade transitions between modes. |

API names mirror the `LiveAsciiController` in [shikigami](https://github.com/phyrextsai/shikigami) so the lib can drop in there and replace the bespoke controller.

#### Properties

| Property | Type | Description |
|---|---|---|
| `model` | `Live2DModel \| null` | The underlying `pixi-live2d-display` model instance. `null` until the model finishes loading. Use this to drive motions / expressions / hit areas / lip-sync directly. |

#### Events

| Event | Detail | Description |
|---|---|---|
| `model-loaded` | `{ model: Live2DModel }` | Fires once per successful `model-url` load, after the model is mounted and the ASCII output is live. |

#### Driving motions / expressions

These features are intentionally **not** wrapped — work with `pixi-live2d-display` directly:

```js
const stage = document.querySelector("ascii-canvas-live2d");

stage.addEventListener("model-loaded", (e) => {
  const model = e.detail.model;

  // Play a random motion from a group:
  model.motion("TapBody");

  // Play a specific motion by index:
  model.motion("TapBody", 2);

  // Apply / clear an expression:
  model.expression("happy");
  model.expression(undefined); // clear

  // List available motions / expressions:
  const motionGroups = model.internalModel.motionManager.definitions;
  const expressions =
    model.internalModel.motionManager.expressionManager?.definitions;
});
```

For lip-sync, hit-area handling, and parameter-level control, see [`pixi-live2d-display` docs](https://github.com/guansss/pixi-live2d-display).

---

## Constraints

| | |
|---|---|
| **Cubism version** | 4.x only. No Cubism 2 support (matches shikigami's choice). |
| **Pixi version** | `^6` only — `pixi-live2d-display@0.4` does not yet support Pixi 7 / 8. |
| **Cubism Core script** | Must be loaded via Live2D's official CDN. Their [Proprietary License](https://www.live2d.com/en/sdk/license/) prohibits self-hosting. |
| **CORS** | Cross-origin model files need server-side `Access-Control-Allow-Origin`. The lib uses `getImageData` internally, which throws `SecurityError` on tainted canvases. |
| **No high-level motion / lip-sync wrappers** | By design. The `model` getter exposes the raw `Live2DModel` (see API section above) — call `model.motion(...)` / `model.expression(...)` / lip-sync APIs directly via `pixi-live2d-display`. We're not wrapping those (see [tasks.md](./tasks.md) "不做清單"). |

---

## How it works

```text
PIXI.Application ──► hidden <canvas>  ──source──►  <ascii-canvas>
                     (in shadow DOM)                (handles rAF +
                                                     downsample +
                                                     drawText loop)
```

The `<ascii-canvas-live2d>` element creates a hidden PIXI app, loads the Live2D model into it, and points the ASCII renderer at PIXI's canvas via the `.source` property. We don't run our own sampling loop — the nested `<ascii-canvas>` does that. Resize / visibility / `prefers-reduced-motion` are all handled by the inner element.

---

## License

MIT © 2026 Phyrex Tsai

### Demo model attribution

The demo (under `demo/`) bundles the **Mao** model, a Cubism SDK official sample provided by Live2D Inc., used under the [Live2D Free Material License Agreement](https://www.live2d.com/eula/live2d-free-material-license-agreement_en.html). The lib itself ships no models — consumers supply their own `model-url`.

The Live2D Cubism Core runtime (`live2dcubismcore.min.js`) is loaded from Live2D's CDN per their [Proprietary Software License](https://www.live2d.com/en/sdk/license/) and is not redistributed.
