import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',  // Explicitly set assets directory
    // rollupOptions: {
    //   output: {
    //     assetFileNames: (assetInfo) => {
    //       if (assetInfo.name?.endsWith('.png') || 
    //           assetInfo.name?.endsWith('.jpg') ||
    //           assetInfo.name?.endsWith('.svg')) {
    //         return 'assets/[name].[ext]'
    //       }
    //       return 'assets/[name]-[hash].[ext]'
    //     }}
    // }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})