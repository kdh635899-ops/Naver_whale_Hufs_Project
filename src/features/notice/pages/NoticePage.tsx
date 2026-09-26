import { useCallback, useEffect, useState, type FormEvent } from "react";
import "./NoticePage.css";
import { NOTICE_ALARM } from "../../../constants/notice";
import { sendToBackground, type BackgroundRequest } from "../../../extension/messaging";
import { useDevTools } from "../../../hooks/useDevTools";
import { useStorageValue } from "../../../hooks/useStorageValue";
import { KEYWORDS_KEY, setKeywords } from "../../../storage/keywords";
import { HAB_LINK_STATUS_KEY, HAB_LINKS_KEY, markNoticesRead, NOTICES_KEY, STATUS_KEY } from "../../../storage/notices";
import { CAPTURE_STATUS_KEY, TIMETABLE_KEY } from "../../../storage/timetable";
import type { LinkLearningStatus, NoticeCheckStatus, StoredNotice } from "../../../types/notice";
import type { CaptureStatus, SavedTimetable } from "../../../types/timetable";

const NO_KEYWORDS: string[] = [];
const NO_NOTICES: StoredNotice[] = [];
const NO_LINKS: Record<string, string> = {};

function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

export function NoticePage() {
  const keywords = useStorageValue<string[]>(KEYWORDS_KEY, NO_KEYWORDS);
  const notices = useStorageValue<StoredNotice[]>(NOTICES_KEY, NO_NOTICES);
  const status = useStorageValue<NoticeCheckStatus | null>(STATUS_KEY, null);
  const timetable = useStorageValue<SavedTimetable | null>(TIMETABLE_KEY, null);
  const learnedLinks = useStorageValue<Record<string, string>>(HAB_LINKS_KEY, NO_LINKS);
  const linkStatus = useStorageValue<LinkLearningStatus | null>(HAB_LINK_STATUS_KEY, null);
  const capture = useStorageValue<CaptureStatus | null>(CAPTURE_STATUS_KEY, null);

  const devTools = useDevTools();
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [alarmText, setAlarmText] = useState("확인 중…");
  const [backgroundText, setBackgroundText] = useState("확인 중…");

  const refreshDiagnostics = useCallback(async () => {
    try {
      const response = await sendToBackground({ type: "ping" });
      setBackgroundText(response?.ok ? "응답함" : "응답 없음");
    } catch {
      setBackgroundText("응답 없음 (서비스 워커가 시작되지 않았어요)");
    }
    const alarm = await chrome.alarms.get(NOTICE_ALARM);
    setAlarmText(alarm ? `등록됨 · 다음 확인 ${formatTime(alarm.scheduledTime)}` : "등록 안 됨");
  }, []);

  useEffect(() => {
    void refreshDiagnostics();
  }, [refreshDiagnostics]);

  async function run(request: BackgroundRequest, describe: (added?: number) => string) {
    setBusy(true);
    setMessage("");
    try {
      const response = await sendToBackground(request);
      setMessage(response?.ok ? describe(response.count ?? response.added) : `실패: ${response ? response.error : "응답 없음"}`);
    } catch (error) {
      setMessage(`background가 응답하지 않아요: ${String(error)}`);
    } finally {
      setBusy(false);
      void refreshDiagnostics();
    }
  }

  async function addKeyword(event: FormEvent) {
    event.preventDefault();
    if (draft.trim() === "") return;
    await setKeywords([...keywords, draft]);
    setDraft("");
  }

  const unread = notices.filter((n) => !n.read).length;

  return (
    <section className="notice-page">
      <h2>공지 알림</h2>

      <form className="keyword-form" onSubmit={addKeyword}>
        <input
          id="keyword-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="알림 받을 키워드 (예: 장학, 채용)"
        />
        <button type="submit">추가</button>
      </form>
      <ul className="keyword-list">
        {keywords.length === 0 && <li className="hint">등록된 키워드가 없어요. 키워드가 없으면 알림은 오지 않고 알림함에만 쌓여요.</li>}
        {keywords.map((k) => (
          <li key={k} className="chip">
            {k}
            <button type="button" aria-label={`${k} 삭제`} onClick={() => void setKeywords(keywords.filter((x) => x !== k))}>
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="actions">
        <button type="button" disabled={busy} onClick={() => void run({ type: "notice:check-now" }, (n) => `확인 완료 · 새 글 ${n ?? 0}건`)}>
          지금 확인
        </button>
        {devTools && (
          <button type="button" disabled={busy} onClick={() => void run({ type: "notice:reset" }, () => "알림함을 비웠어요")}>
            기록 초기화 (개발용)
          </button>
        )}
      </div>
      {devTools && (
        <div className="actions demo-tools">
          <span className="demo-label">시연 도구</span>
          <button type="button" disabled={busy} onClick={() => void run({ type: "timetable:seed-demo" }, () => "샘플 시간표를 넣었어요. BOO 말풍선을 확인해보세요")}>
            샘플 시간표 넣기
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void run({ type: "timetable:check-reminders", remindBeforeMinutes: 180 }, (n) => (n ? `수업 알림 ${n}건을 보냈어요` : "곧 시작하는 수업이 없거나 이미 알렸어요"))
            }
          >
            수업 알림 지금 확인
          </button>
          <button type="button" disabled={busy} onClick={() => void run({ type: "timetable:reset" }, () => "시간표를 지웠어요. 종합정보시스템 개인시간표를 새로고침하면 다시 저장돼요")}>
            시간표 지우기
          </button>
        </div>
      )}
      {message && <p className="message">{message}</p>}

      {devTools && (
        <>
          <dl className="status">
            <dt>background</dt>
            <dd>{backgroundText}</dd>
            <dt>30분 알람</dt>
            <dd>{alarmText}</dd>
            <dt>마지막 확인</dt>
            <dd>
              {status
                ? `${formatTime(status.at)} · 새 글 ${status.added}건${status.failedBoards.length ? ` · 실패: ${status.failedBoards.join(", ")}` : ""}`
                : "아직 없음"}
            </dd>
            <dt>시간표</dt>
            <dd>
              {timetable
                ? `${timetable.semester ? `${timetable.semester}학기 · ` : ""}${timetable.entries.length}개 수업 · ${formatTime(timetable.savedAt)} 저장`
                : "아직 저장 안 됨 (종합정보시스템에서 개인시간표를 열어주세요)"}
              {capture && (capture.kind === "no-table" || capture.kind === "empty") && ` · ${capture.message}`}
            </dd>
            <dt>훕스 링크</dt>
            <dd>
              {linkStatus
                ? [
                    `공고 ${linkStatus.linked}개 연결${linkStatus.example ? ` (예: ${linkStatus.example})` : ""}`,
                    linkStatus.generic ? `같은 주소로만 연결돼 제외 ${linkStatus.generic}개 (${linkStatus.genericUrl ?? ""})` : "",
                    linkStatus.scriptOnly ? `주소 없는 항목 ${linkStatus.scriptOnly}개 (${linkStatus.sample ?? ""})` : ""
                  ]
                    .filter(Boolean)
                    .join(" · ")
                : "로그인한 훕스어빌리티 화면을 한 번 열면 공고 링크를 기억해요"}
            </dd>
          </dl>
          <p className="hint">알림 팝업이 안 뜨면 윈도우의 알림 설정(집중 지원/방해 금지)을 확인해보세요.</p>
        </>
      )}

      <h3>
        알림함 <small>안 읽음 {unread} / 전체 {notices.length}</small>
        <button type="button" className="read-all" disabled={unread === 0} onClick={() => void markNoticesRead()}>
          모두 읽음
        </button>
      </h3>
      <ul className="notice-list">
        {notices.length === 0 && <li className="hint">아직 저장된 공지가 없어요.</li>}
        {notices.map((n) => (
          <li key={n.id} className={n.read ? "" : "unread"}>
            <a href={learnedLinks[n.id] ?? n.url} target="_blank" rel="noreferrer" onClick={() => void markNoticesRead([n.id])}>
              {n.title}
            </a>
            <span className="meta">
              {n.source} · {n.date}
              {n.deadline && ` · 마감 ${n.deadline.slice(5, 10)}`}
              {n.matchedKeywords.map((k) => (
                <mark key={k}>{k}</mark>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
