import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";

const PROJECT_DIR_NAME = "brieblast-landing";
const defaultExternalEnvDir = process.env.HOME ? path.join(process.env.HOME, PROJECT_DIR_NAME) : null;
const configuredExternalEnvDir = process.env.EXTERNAL_ENV_DIR ?? defaultExternalEnvDir;
const externalEnvFile = configuredExternalEnvDir ? path.join(configuredExternalEnvDir, ".env") : null;

let envDir = __dirname;
try {
  if (externalEnvFile && configuredExternalEnvDir) {
    fs.accessSync(externalEnvFile, fs.constants.R_OK);
    envDir = configuredExternalEnvDir;
  }
} catch {
  if (process.env.EXTERNAL_ENV_DIR) {
    console.warn(
      `EXTERNAL_ENV_DIR is set but ${externalEnvFile ?? "<missing .env path>"} is not readable; falling back to project env directory. Verify the directory exists and the .env file has read permissions.`,
    );
  }
}

// https://vitejs.dev/config/
export default defineConfig(() => ({
  envDir,
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
