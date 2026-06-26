import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    env: {
      JWT_SECRET: "test-secret-for-vitest",
      MONGODB_URI: "mongodb://localhost:27017/test",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      SMTP_HOST: "localhost",
      SMTP_PORT: "1025",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "html"],
      include: ["lib/**/*.ts", "app/api/**/*.ts"],
      exclude: ["node_modules", ".next", "tests"],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 50,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
