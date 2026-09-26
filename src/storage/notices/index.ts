import type { NoticeCheckStatus, StoredNotice } from "../../types/notice";

// 단순 저장·조회만 담당한다. "무엇이 새 글인가" 같은 판단은 features/notice/model에 둔다.
export const NOTICES_KEY = "allNotices";
export const STATUS_KEY = "noticeCheckStatus";

export async function getNotices(): Promise<StoredNotice[]> {
  const stored = await chrome.storage.local.get(NOTICES_KEY);
  return Array.isArray(stored[NOTICES_KEY]) ? (stored[NOTICES_KEY] as StoredNotice[]) : [];
}

export function saveNotices(notices: StoredNotice[]): Promise<void> {
  return chrome.storage.local.set({ [NOTICES_KEY]: notices });
}

export function saveCheckStatus(status: NoticeCheckStatus): Promise<void> {
  return chrome.storage.local.set({ [STATUS_KEY]: status });
}

export function clearNotices(): Promise<void> {
  return chrome.storage.local.remove([NOTICES_KEY, STATUS_KEY]);
}
