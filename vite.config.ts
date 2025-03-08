import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

import { componentTagger } from 'lovable-tagger'

export default defineConfig(({ mode }) => ({
  base: mode === "development" ? "/" : "/holy-video-helper/",
  server: {
    host: "::",
    port: 8080,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode)
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // This is critical - it ensures the correct base path
      base: mode === "development" ? "/" : "/holy-video-helper/",
      strategies: 'generateSW',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        cleanupOutdatedCaches: true,
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg', 'icons/icon-192x192.png', 'icons/icon-512x512.png'],
      manifest: {
        name: 'khelwatk',
        short_name: 'khelwatk',
        description: 'khelwatk',
        theme_color: '#ffffff',
        start_url: mode === "development" ? "/" : "/holy-video-helper/",
        scope: mode === "development" ? "/" : "/holy-video-helper/",
        display: 'standalone',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
    mode === 'development' &&  componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        }
      }
    }
  }
}));