import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0", // Allow external connections for Codespaces
    port: 5173,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 24678, // Different port for HMR to avoid conflicts
    },
    // Codespace optimization
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
});
