import type { StoredNotice } from "../../types/notice";

// 단순 저장·조회만 담당한다. "무엇이 새 글인가" 같은 판단은 features/notice/model에 둔다.
const KEY = "allNotices";

export async function getNotices(): Promise<StoredNotice[]> {
  const stored = await chrome.storage.local.get(KEY);
  return Array.isArray(stored[KEY]) ? (stored[KEY] as StoredNotice[]) : [];
}

export function saveNotices(notices: StoredNotice[]): Promise<void> {
  return chrome.storage.local.set({ [KEY]: notices });
}

export function clearNotices(): Promise<void> {
  return chrome.storage.local.remove(KEY);
}
