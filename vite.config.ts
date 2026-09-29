import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  root: "apps/web",
  base: mode === "github-pages" ? "/nuble-vaeriq/" : "/",
  build: {
    outDir: "../../dist-web",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: "index.html",
        feedback: "feedback.html"
      }
    }
  }
}));
