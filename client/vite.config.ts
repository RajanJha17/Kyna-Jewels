import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "lee-untiring-valentina.ngrok-free.dev",
      "spotty-rockets-appear.loca.lt",
    ],
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "lucide-react": path.resolve(__dirname, "node_modules/lucide-react"),
    },
  },
});
