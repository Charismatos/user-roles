import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";

export default defineConfig({
    plugins: [
        laravel({
            input: [
                "resources/css/app.css",
                "resources/css/Groupings/Editor/categories.css",

                "resources/js/app.js",
                "resources/js/Groupings/Editor/categories.js",
            ],
            refresh: true,
        }),
    ],
    // ADD THIS BLOCK FOR SAIL / DOCKER
    server: {
        host: "0.0.0.0",
        port: 5173,
        strictPort: true,
        hmr: {
            host: "localhost",
        },
        watch: {
            usePolling: true,
        },
    },
});
