import { useCallback, useMemo, useState } from "react";
import "./BooHome.css";
import { useStorageValue } from "../../../hooks/useStorageValue";
import { NOTICES_KEY } from "../../../storage/notices";
import type { StoredNotice } from "../../../types/notice";
import { NoticePage } from "../../notice/pages/NoticePage";
import { BooCharacter } from "../components/BooCharacter";
import { NoticePanel } from "../components/NoticePanel";
import { describeNotices } from "../logic/bubbleMessage";

const NO_NOTICES: StoredNotice[] = [];

// 메인 화면: BOO가 말풍선으로 알려주고, BOO를 누르면 알림함 창이 열린다.
export function BooHome() {
  const notices = useStorageValue<StoredNotice[]>(NOTICES_KEY, NO_NOTICES);
  const [open, setOpen] = useState(false);
  const { unread, mood, message } = useMemo(() => describeNotices(notices), [notices]);
  const close = useCallback(() => setOpen(false), []);

  return (
    <div className="boo-home">
      <p className="boo-bubble" role="status">
        {message}
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
