import { useStorageValue } from "./useStorageValue";

// 개발 도구(상태 박스, 시연 도구)는 개발용 빌드에서만 존재한다. (프로젝트 폴더의 .env.local 에 VITE_WAVOO_DEV=true)
// 그 빌드에서도 기본은 숨김이고, 로고를 빠르게 5번 누르면 켜고 끌 수 있다. 제출용 빌드에는 아예 들어가지 않는다.
export const DEV_BUILD = import.meta.env.VITE_WAVOO_DEV === "true";
export const DEV_TOOLS_KEY = "devTools";

export function useDevTools(): boolean {
  const on = useStorageValue<boolean>(DEV_TOOLS_KEY, false);
  return DEV_BUILD && on;
}

export function setDevTools(on: boolean): Promise<void> {
  return chrome.storage.local.set({ [DEV_TOOLS_KEY]: on });
}
