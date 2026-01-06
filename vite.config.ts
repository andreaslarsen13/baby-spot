import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    allowedHosts: true,
    // Disable HMR for stable mobile testing via ngrok
    // The WebSocket connection through tunnels causes page reloads
    hmr: false,
  },
})
