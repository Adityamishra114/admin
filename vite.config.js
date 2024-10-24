import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/admin/",
  build: {
    rollupOptions: {
      output: {
        // Set the chunk size limit here in bytes (e.g., 500 KB)
        chunkFileNames: 'assets/[name]-[hash].js',
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id
              .toString()
              .split('node_modules/')[1]
              .split('/')[0]
              .toString();
          }
        },
      },
    },
    // Optionally, you can specify a larger chunk size limit (default is 500 KB)
    chunkSizeWarningLimit: 1000, // Set to 1000 KB or any size you prefer
  },
});
