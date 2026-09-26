import { useCallback, useEffect, useMemo, useState } from "react";
import "./BooHome.css";
import { useStorageValue } from "../../../hooks/useStorageValue";
import { NOTICES_KEY } from "../../../storage/notices";
import { TIMETABLE_KEY } from "../../../storage/timetable";
import type { StoredNotice } from "../../../types/notice";
import type { SavedTimetable, TimetableEntry } from "../../../types/timetable";
import { NoticePage } from "../../notice/pages/NoticePage";
import { BooCharacter } from "../components/BooCharacter";
import { NoticePanel } from "../components/NoticePanel";
import { describeBoo } from "../logic/bubbleMessage";

const NO_NOTICES: StoredNotice[] = [];
const NO_ENTRIES: TimetableEntry[] = [];
/** 말풍선 문장을 바꾸는 간격 */
export const MESSAGE_ROTATE_MS = 6000;
/** 시간 기반 문장(다음 수업까지 N분)을 다시 계산하는 간격 */
const CLOCK_TICK_MS = 30_000;

// 메인 화면: BOO가 말풍선으로 알려주고, BOO를 누르면 알림함 창이 열린다.
export function BooHome() {
  const notices = useStorageValue<StoredNotice[]>(NOTICES_KEY, NO_NOTICES);
  const timetable = useStorageValue<SavedTimetable | null>(TIMETABLE_KEY, null);
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [turn, setTurn] = useState(0);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), CLOCK_TICK_MS);
    const rotate = setInterval(() => setTurn((t) => t + 1), MESSAGE_ROTATE_MS);
    return () => {
      clearInterval(tick);
      clearInterval(rotate);
    };
  }, []);

  const entries = timetable?.entries ?? NO_ENTRIES;
  const { unread, mood, messages } = useMemo(() => describeBoo({ notices, entries, now }), [notices, entries, now]);
  const close = useCallback(() => setOpen(false), []);

  return (
    <div className="boo-home">
      <p className="boo-bubble" role="status">
        {messages[turn % messages.length]}
      </p>
      <button
        type="button"
        className="boo-button"
        aria-label={`BOO 알림함 열기 (안 읽은 공지 ${unread}건)`}
        onClick={() => setOpen(true)}
      >
        <BooCharacter mood={mood} />
        {unread > 0 && <span className="boo-badge">{unread > 99 ? "99+" : unread}</span>}
      </button>
      <p className="boo-hint">BOO를 눌러 알림함을 열어보세요</p>

      <NoticePanel open={open} onClose={close}>
        <NoticePage />
      </NoticePanel>
    </div>
  );
}
