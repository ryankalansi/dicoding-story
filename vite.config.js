import { defineConfig } from "vite";
import { resolve } from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/",
  root: resolve(__dirname, "src"),
  publicDir: resolve(__dirname, "src", "public"),
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "favicon-192.png", "favicon-512.png"],
      manifest: {
        name: "Dicoding Stories",
        short_name: "Stories",
        description: "Share your journey with Dicoding!",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#1a73e8",
        icons: [
          {
            src: "/favicon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/favicon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/story-api\.dicoding\.dev\/v1\//,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60,
              },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern:
              /^https:\/\/story-api\.dicoding\.dev\/images\/stories\//,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "story-images",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 7 * 24 * 60 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/ui-avatars\.com\/api/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "avatar-images",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 7 * 24 * 60 * 60,
              },
            },
          },
        ],
      },
      strategies: "injectManifest",
      srcDir: ".", // karena root = src, maka ini cukup
      filename: "service-worker.js", // hanya "service-worker.js", TANPA "src/"
      injectRegister: "auto",
      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
  ],
});
