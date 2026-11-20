import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts", "src/migrate.ts"],
  format: ["esm"],
  target: "node22",
  outDir: "dist",
  clean: true,
  sourcemap: true,
  // Los paquetes del monorepo (@app/*) se empaquetan dentro del build; el resto queda en node_modules.
  noExternal: [/^@app\//],
});
