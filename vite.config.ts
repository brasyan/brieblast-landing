import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

const externalEnvDir = "/root/brieblast-landing";
const envDir = fs.existsSync(path.join(externalEnvDir, ".env")) ? externalEnvDir : __dirname;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  envDir,
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
