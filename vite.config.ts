import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  root: fileURLToPath(new URL("./demo", import.meta.url)),
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  // Relative base so the same build works at root, on GH Pages subpath
  // (/ascii-canvas-live2d/), or anywhere else without rewriting URLs.
  base: "./",
  server: { port: 5173, host: true },
  build: {
    outDir: fileURLToPath(new URL("./dist-demo", import.meta.url)),
    emptyOutDir: true,
  },
});
