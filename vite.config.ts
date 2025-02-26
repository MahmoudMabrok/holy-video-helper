
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === "development" ?  "/" : "/holy-video-helper/",
  server: {
    host: "::",
    port: 8080,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('development')
  },
  plugins: [
    react({
      // Enable React Refresh and development mode features
      swcOptions: {
        jsc: {
          transform: {
            react: {
              development: true,
              refresh: true
            }
          }
        }
      }
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
