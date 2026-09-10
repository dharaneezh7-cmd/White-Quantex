import { reactRouter } from "@react-router/dev/vite"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import path from "path"

export default defineConfig({
  plugins: [tsconfigPaths(), tailwindcss(), reactRouter()],
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
  },
  server: {
    port: 7000,
    proxy: {
      "/api/spring": {
        target: process.env.VITE_SPRING_API_URL || "http://127.0.0.1:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/spring/, "/api"),
        configure: (proxy) => {
          proxy.on("error", (_err, _req, res) => {
            if (res && !res.headersSent) {
              res.writeHead(503, { "Content-Type": "application/json" })
              res.end(JSON.stringify({ success: false, data: null, message: "Spring backend service unavailable" }))
            }
          })
        },
      },
      "/api/node": {
        target: process.env.VITE_NODE_API_URL || "http://127.0.0.1:3001",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/node/, "/api"),
        configure: (proxy) => {
          proxy.on("error", (_err, _req, res) => {
            if (res && !res.headersSent) {
              res.writeHead(503, { "Content-Type": "application/json" })
              res.end(JSON.stringify({ success: false, data: null, message: "Node backend service unavailable" }))
            }
          })
        },
      },
    },
  },
})
