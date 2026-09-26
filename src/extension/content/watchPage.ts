// 화면이 바뀔 때마다 (조금 기다렸다가) 작업을 다시 실행하는 감시기. content script 두 곳이 함께 쓴다.
//
// 확장앱을 새로고침(개발)하거나 업데이트하면, 이미 열려 있던 탭에는 옛 content script가 남는데
// 그 코드가 부르는 chrome API는 "Extension context invalidated"로 실패한다.
// 그런 경우엔 오류를 쌓지 않고 조용히 감시를 멈춘다. (새 코드는 페이지를 새로고침하면 들어간다)

export function isExtensionAlive(): boolean {
  try {
    return Boolean(chrome.runtime?.id);
  } catch {
    return false;
  }
}

const isInvalidated = (error: unknown) => /Extension context invalidated/i.test(String((error as Error)?.message ?? error));

export function watchPage(task: () => Promise<void>, debounceMs: number, failureLabel: string) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const observer = new MutationObserver(schedule);

  function stop() {
    clearTimeout(timer);
    observer.disconnect();
  }

  async function run() {
    if (!isExtensionAlive()) return stop();
    try {
      await task();
    } catch (error) {
      if (isInvalidated(error) || !isExtensionAlive()) return stop();
      console.warn(`[WAVOO] ${failureLabel}`, error);
    }
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(() => void run(), debounceMs);
  }

  observer.observe(document.documentElement, { childList: true, subtree: true });
  schedule();
}
