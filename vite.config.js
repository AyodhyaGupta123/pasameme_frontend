import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

const renderPort = Number(process.env.PORT) || 5173;

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: renderPort,
    strictPort: true,
    allowedHosts: [
      "meme-frontend-piou.onrender.com",
      ".onrender.com",
      "pasameme.in",
      "www.pasameme.in",
    ],
  },
  preview: {
    host: "0.0.0.0",
    port: renderPort,
    strictPort: true,
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: [
        "pwa/favicon.ico",
        "pwa/apple-touch-icon-180x180.png",
        "pwa/pwa-64x64.png",
        "pwa/pwa-192x192.png",
        "pwa/pwa-512x512.png",
        "pwa/maskable-icon-512x512.png",
      ],
      manifest: {
        name: "Pasa Meme",
        short_name: "PasaMeme",
        description: "Pasa Meme Trading Dashboard",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#0b0e11",
        background_color: "#0b0e11",
        icons: [
          {
            src: "pwa/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa/maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: "/index.html",
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
});
