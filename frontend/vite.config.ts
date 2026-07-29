import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const fromSrc = (segment: string) =>
  fileURLToPath(new URL(`./src/${segment}`, import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Must stay in sync with `compilerOptions.paths` in tsconfig.app.json.
    alias: {
      "@core": fromSrc("core"),
      "@ds": fromSrc("design-system"),
      "@survey": fromSrc("modules/survey"),
      "@app": fromSrc("app"),
      "@utils": path.resolve(__dirname, "./utils"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
