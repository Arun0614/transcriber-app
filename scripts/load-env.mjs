import fs from "node:fs";
import path from "node:path";
import { config as loadDotenv } from "dotenv";

export function loadEnv() {
  const cwd = process.cwd();
  const envFiles = [".env.local", ".env"];

  for (const file of envFiles) {
    const fullPath = path.join(cwd, file);
    if (fs.existsSync(fullPath)) {
      loadDotenv({ path: fullPath, override: false });
    }
  }
}
