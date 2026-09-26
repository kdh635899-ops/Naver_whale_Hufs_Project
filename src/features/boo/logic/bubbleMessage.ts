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

// 알림함 상태를 보고 BOO가 무슨 말을 할지 정한다. 저장소·화면과 무관한 순수 함수라서 단독으로 시험할 수 있다.
export function describeNotices(notices: StoredNotice[]): BooSummary {
  const unread = notices.filter((n) => !n.read);
  const matched = unread.filter((n) => n.matchedKeywords.length > 0);

  if (matched.length > 0) {
    return {
      unread: unread.length,
      mood: "alert",
      message: `'${matched[0].matchedKeywords[0]}' 공지가 ${matched.length}건 올라왔어요!`
    };
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
