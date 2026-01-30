// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
  const isProd = mode === "production";

  return {
    plugins: [react()],
    base: "/",
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
        "@components": resolve(__dirname, "src/components"),
        "@pages": resolve(__dirname, "src/pages"),
        "@utils": resolve(__dirname, "src/utils"),
        "@seo": resolve(__dirname, "src/seo"),
        "@landing": resolve(__dirname, "src/landing"),
        "@config": resolve(__dirname, "src/config"),
        "@api": resolve(__dirname, "src/api"),
        "@hooks": resolve(__dirname, "src/hooks"),
      },
      dedupe: ["react", "react-dom", "@emotion/react", "@emotion/styled"],
    },
    esbuild: isProd ? { drop: ["console", "debugger"] } : undefined,
    build: {
      sourcemap: false,      // disabled in prod to reduce memory during Docker build
      minify: "esbuild",
      target: "es2018",
      outDir: "dist",
      emptyOutDir: true,
    },
  };
});
