import type { StoredNotice } from "../../../types/notice";
import type { TimetableEntry } from "../../../types/timetable";
import { describeTimetable } from "./timetable";

export type BooMood = "idle" | "alert";

export interface BooSummary {
  unread: number;
  mood: BooMood;
  /** BOO가 말풍선으로 하는 말 */
  message: string;
}

/** 말풍선에 넣기엔 긴 제목을 줄인다 */
const TITLE_LIMIT = 26;
function shortenTitle(title: string): string {
  return title.length > TITLE_LIMIT ? `${title.slice(0, TITLE_LIMIT)}…` : title;
}

// 키워드에 걸린 공지 중 가장 최근 것의 제목을 그대로 불러 말한다. 나머지는 개수로만 덧붙인다.
function describeKeywordMatches(matched: StoredNotice[]): string {
  const [latest, ...restList] = [...matched].sort((a, b) => b.fetchedAt - a.fetchedAt);
  const rest = restList.length > 0 ? ` (외 ${restList.length}건)` : "";
  return `'${shortenTitle(latest.title)}' 공고가 ${latest.source}에서 올라왔어요${rest}! 얼른 확인해보시죠!`;
}

// 알림함 상태를 보고 BOO가 무슨 말을 할지 정한다. 저장소·화면과 무관한 순수 함수라서 단독으로 시험할 수 있다.
export function describeNotices(notices: StoredNotice[]): BooSummary {
  const unread = notices.filter((n) => !n.read);
  const matched = unread.filter((n) => n.matchedKeywords.length > 0);

  if (matched.length > 0) {
    // 공지가 아무리 많이 쌓여도, 내가 등록한 키워드에 걸린 것만 BOO가 콕 집어 알려준다.
    return { unread: unread.length, mood: "alert", message: describeKeywordMatches(matched) };
  }
  if (unread.length > 0) {
    return { unread: unread.length, mood: "idle", message: `안 읽은 공지가 ${unread.length}건 있어요.` };
  }
  if (notices.length === 0) {
    return { unread: 0, mood: "idle", message: "공지를 확인하고 있어요. 조금만 기다려 주세요!" };
  }
  return { unread: 0, mood: "idle", message: "새 공지는 없어요. 좋은 하루 보내세요!" };
}

export interface BooView {
  unread: number;
  mood: BooMood;
  /** BOO가 번갈아 말할 문장들. 가장 급한 것이 맨 앞이다. */
  messages: string[];
}

// 공지와 시간표를 합쳐 BOO가 무슨 말을 할지 정한다. 곧 시작하는 수업이 있으면 그 말을 먼저 한다.
export function describeBoo({ notices, entries, now }: { notices: StoredNotice[]; entries: TimetableEntry[]; now: number }): BooView {
  const notice = describeNotices(notices);
  const timetable = describeTimetable(entries, now);
  return {
    unread: notice.unread,
    mood: timetable.urgent || notice.mood === "alert" ? "alert" : "idle",
    messages: timetable.urgent ? [...timetable.messages, notice.message] : [notice.message, ...timetable.messages]
  };
}
