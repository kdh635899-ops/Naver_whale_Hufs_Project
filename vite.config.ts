import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json" with { type: "json" };

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  build: {
    rollupOptions: {
      // 웨일 전용 sidebar_action.default_page는 crxjs가 모르므로 직접 빌드 대상에 넣는다.
      input: { sidebar: "index.html" }
    }
  }
});
