import type { FetchedBoard, StoredNotice } from "../../../types/notice";

// "새 글 판정"을 하는 순수 함수. 저장소·브라우저 API에 의존하지 않아서 단독으로 시험할 수 있다.

export interface MergeInput {
  stored: StoredNotice[];
  fetched: FetchedBoard[];
  keywords: string[];
  now: number;
  /** 게시판을 처음 확인할 때, 작성일이 이 기간 안이면 안 읽음으로 보관한다 */
  recentDays?: number;
  /** 알림함 최대 보관 개수 */
  cap?: number;
}

export interface MergeResult {
  merged: StoredNotice[];
  /** 이번에 새로 발견한 글 */
  added: StoredNotice[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function matchKeywords(title: string, keywords: string[]): string[] {
  const lowered = title.toLowerCase();
  return keywords.filter((k) => k.trim() !== "" && lowered.includes(k.trim().toLowerCase()));
}

// "ssai:2104:266290" -> "ssai:2104" (게시판 단위)
function boardKey(id: string): string {
  return id.split(":").slice(0, 2).join(":");
}

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

// 게시판 날짜는 시각 없이 날짜만 있으므로, 확인 시각과 관계없이 "일" 단위로 비교한다 (한국 시간 기준).
function isRecent(date: string, now: number, recentDays: number): boolean {
  const posted = Date.parse(`${date}T00:00:00+09:00`);
  const todayStart = Math.floor((now + KST_OFFSET_MS) / DAY_MS) * DAY_MS - KST_OFFSET_MS;
  return Number.isFinite(posted) && todayStart - posted <= recentDays * DAY_MS;
}

export function mergeNewPosts({ stored, fetched, keywords, now, recentDays = 14, cap = 200 }: MergeInput): MergeResult {
  const knownIds = new Set(stored.map((n) => n.id));
  const knownBoards = new Set(stored.map((n) => boardKey(n.id)));
  const added: StoredNotice[] = [];

  for (const { source, posts } of fetched) {
    if (posts.length === 0) continue;
    // 이 게시판이 저장소에 하나도 없으면 첫 확인이다. 과거 글이 한꺼번에 "새 글"이 되지 않게 한다.
    const isFirstCheck = !knownBoards.has(boardKey(posts[0].id));

    for (const post of posts) {
      if (knownIds.has(post.id)) continue;
      knownIds.add(post.id);
      added.push({
        ...post,
        source,
        fetchedAt: now,
        read: isFirstCheck ? !isRecent(post.date, now, recentDays) : false,
        matchedKeywords: matchKeywords(post.title, keywords)
      });
    }
  }

  const merged = [...added, ...stored]
    .sort((a, b) => b.date.localeCompare(a.date) || b.fetchedAt - a.fetchedAt)
    .slice(0, cap);

  return { merged, added };
}
