import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";
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
                target: process.env.VITE_SPRING_API_URL || "http://localhost:8080",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/spring/, "/api"),
            },
            "/api/node": {
                target: process.env.VITE_NODE_API_URL || "http://localhost:3001",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/node/, "/api"),
            },
        },
    },
});
