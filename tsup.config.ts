import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/babylon.ts", "src/dom.tsx", "src/react.tsx", "src/canvas/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "@babylonjs/core", "@particle-academy/react-fancy"],
  treeshake: true,
});
