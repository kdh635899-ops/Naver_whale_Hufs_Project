// wis.hufs.ac.kr(종합정보시스템) 화면에 주입되는 content script.
// 사용자가 직접 로그인해서 개인시간표 화면을 열면, 화면에 이미 떠 있는 시간표 표를 읽어
// 이 컴퓨터의 storage에만 저장한다. 로그인이나 계정 정보는 다루지 않고, 서버로 보내는 것도 없다.
import { parseTimetable } from "../../services/timetable/parseTimetableTable";
import { getTimetable, saveCaptureStatus, saveTimetable } from "../../storage/timetable";

const DEBOUNCE_MS = 500;
const TOAST_MS = 4000;

function showToast(message: string) {
  if (!document.body) return;
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.setAttribute("role", "status");
  Object.assign(toast.style, {
    position: "fixed",
    top: "16px",
    right: "16px",
    zIndex: "2147483647",
    padding: "10px 14px",
    background: "#0f6e7d",
    color: "#fff",
    borderRadius: "8px",
    font: "14px/1.4 'Malgun Gothic', sans-serif",
    boxShadow: "0 2px 8px rgba(0,0,0,0.25)"
  });
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), TOAST_MS);
}

async function capture() {
  const result = parseTimetable(document);
  const now = Date.now();

  if (result.status === "no-table") {
    // 개인시간표 화면인데 표를 못 읽은 경우만 기록한다. 다른 화면·프레임에서는 조용히 넘어간다.
    if (document.body?.textContent?.includes("개인시간표")) {
      await saveCaptureStatus({ at: now, kind: "no-table", message: `개인시간표 화면이지만 표를 읽지 못했어요 (표 ${result.tableCount}개 발견)` });
    }
    return;
  }

  if (result.status === "empty") {
    // 표만 있고 수업이 없으면(아직 로딩 중일 수 있음) 기존 시간표를 지우지 않는다.
    await saveCaptureStatus({ at: now, kind: "empty", message: "시간표 표는 찾았지만 수업이 없어요" });
    return;
  }

  const saved = await getTimetable();
  const unchanged =
    saved !== null && saved.semester === result.semester && JSON.stringify(saved.entries) === JSON.stringify(result.entries);
  if (unchanged) {
    await saveCaptureStatus({ at: now, kind: "unchanged", message: `저장된 시간표와 같아요 (${result.entries.length}개 수업)` });
    return;
  }

  await saveTimetable(result.entries, now, result.semester);
  await saveCaptureStatus({ at: now, kind: "saved", message: `시간표를 저장했어요 (${result.entries.length}개 수업)` });
  showToast(`BOO가 시간표를 저장했어요 (${result.entries.length}개 수업)`);
}

let timer: ReturnType<typeof setTimeout> | undefined;

// 표가 나중에 그려지거나(비동기) 학기를 바꿔 다시 그려질 수 있어서, 화면이 바뀔 때마다 조금 기다렸다가 다시 확인한다.
function schedule() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    capture().catch((error) => console.warn("[WAVOO] 시간표 읽기 실패", error));
  }, DEBOUNCE_MS);
}

new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
schedule();
