import { useStorageValue } from "./useStorageValue";

// 개발 도구(상태 박스, 시연 도구)는 기본으로 숨겨져 있고, 로고를 빠르게 5번 누르면 켜고 끌 수 있다.
export const DEV_TOOLS_KEY = "devTools";

export function useDevTools(): boolean {
  return useStorageValue<boolean>(DEV_TOOLS_KEY, false);
}

export function setDevTools(on: boolean): Promise<void> {
  return chrome.storage.local.set({ [DEV_TOOLS_KEY]: on });
}
