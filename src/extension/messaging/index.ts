// 사이드바 화면 ↔ background 사이의 메시지 규약.
export type BackgroundRequest =
  | { type: "ping" }
  | { type: "notice:check-now" }
  | { type: "notice:reset" };

export type BackgroundResponse = { ok: true; added?: number } | { ok: false; error: string };

// background가 시작되지 않았거나 응답하지 않으면 reject되거나 undefined가 돌아온다.
export function sendToBackground(request: BackgroundRequest): Promise<BackgroundResponse | undefined> {
  return chrome.runtime.sendMessage(request);
}
