import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        // Split the heavy vendors into their own chunks so the initial
        // bundle stays small (recharts + framer-motion are the big ones).
        // Vite 8 / Rolldown wants manualChunks as a function.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("recharts") || id.includes("d3-")) return "charts";
          if (id.includes("framer-motion") || id.includes("motion-dom"))
            return "motion";
          if (
            id.includes("react-dom") ||
            id.includes("react-router") ||
            id.includes("/react/")
          )
            return "react";
          return "vendor";
        },
      },
    },
  },
});
