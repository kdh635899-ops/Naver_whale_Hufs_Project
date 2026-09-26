import { useEffect, useState } from "react";

// chrome.storage.local의 값을 구독한다. 다른 곳(background 등)에서 값이 바뀌면 화면이 자동으로 갱신된다.
export function useStorageValue<T>(key: string, fallback: T): T {
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    let alive = true;
    chrome.storage.local.get(key).then((stored) => {
      if (alive && key in stored) setValue(stored[key] as T);
    });
    const onChanged = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area === "local" && key in changes) setValue((changes[key].newValue as T | undefined) ?? fallback);
    };
    chrome.storage.onChanged.addListener(onChanged);
    return () => {
      alive = false;
      chrome.storage.onChanged.removeListener(onChanged);
    };
    // fallback은 매번 새 객체일 수 있어 의존성에서 뺀다.
  }, [key]);

  return value;
}
