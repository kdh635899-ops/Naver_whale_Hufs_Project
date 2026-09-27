import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json" assert { type: "json" };

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  // crxjs는 Whale 전용 sidebar_action을 모르므로 사이드바 페이지를 직접 빌드 입력에 추가
  // (문자열 "index.html"은 crxjs가 기본값으로 보고 stub 처리하므로 객체 형태로 지정)
  build: { rollupOptions: { input: { sidebar: "index.html" } } }
});
