import type { LinkLearningStatus, NoticeCheckStatus, StoredNotice } from "../../types/notice";

// 단순 저장·조회만 담당한다. "무엇이 새 글인가" 같은 판단은 features/notice/model에 둔다.
export const NOTICES_KEY = "allNotices";
export const STATUS_KEY = "noticeCheckStatus";
export const HAB_LINKS_KEY = "hufsabilityLinks";
export const HAB_LINK_STATUS_KEY = "hufsabilityLinkStatus";

export async function getNotices(): Promise<StoredNotice[]> {
  const stored = await chrome.storage.local.get(NOTICES_KEY);
  return Array.isArray(stored[NOTICES_KEY]) ? (stored[NOTICES_KEY] as StoredNotice[]) : [];
}

export function saveNotices(notices: StoredNotice[]): Promise<void> {
  return chrome.storage.local.set({ [NOTICES_KEY]: notices });
}

/** ids를 주면 그 글만, 안 주면 전부 읽음 처리한다. */
export async function markNoticesRead(ids?: string[]): Promise<void> {
  const target = ids ? new Set(ids) : null;
  const notices = await getNotices();
  await saveNotices(notices.map((n) => (!n.read && (!target || target.has(n.id)) ? { ...n, read: true } : n)));
}

export function saveCheckStatus(status: NoticeCheckStatus): Promise<void> {
  return chrome.storage.local.set({ [STATUS_KEY]: status });
}

export function clearNotices(): Promise<void> {
  return chrome.storage.local.remove([NOTICES_KEY, STATUS_KEY, HAB_LINKS_KEY, HAB_LINK_STATUS_KEY]);
}

/** 훕스어빌리티 공고 id -> 로그인 화면에서 배운 진짜 링크 */
export async function getLearnedLinks(): Promise<Record<string, string>> {
  const stored = await chrome.storage.local.get(HAB_LINKS_KEY);
  const value = stored[HAB_LINKS_KEY];
  return value && typeof value === "object" ? (value as Record<string, string>) : {};
}

export function saveLearnedLinks(links: Record<string, string>): Promise<void> {
  return chrome.storage.local.set({ [HAB_LINKS_KEY]: links });
}

export function saveLinkStatus(status: LinkLearningStatus): Promise<void> {
  return chrome.storage.local.set({ [HAB_LINK_STATUS_KEY]: status });
}
