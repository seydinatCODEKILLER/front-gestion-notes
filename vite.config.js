import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiUrl = env.VITE_API_URL;
  return {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@utils": path.resolve(__dirname, "./src/utils"),
        "@services": path.resolve(__dirname, "./src/services"),
        "@features": path.resolve(__dirname, "./src/features"),
        "@config": path.resolve(__dirname, "./src/config"),
        "@app": path.resolve(__dirname, "./src/app"),
        "@assets": path.resolve(__dirname, "./src/assets"),
        "@layout": path.resolve(__dirname, "./src/layout"),
      },
    },
    base: "/",
    build: {
      outDir: "dist",
    },
    server: {
      proxy:
        mode === "development"
          ? {
              "/api": {
                target: apiUrl,
                changeOrigin: true,
                rewrite: (path) => path,
              },
            }
          : undefined,
    },
  };
});
