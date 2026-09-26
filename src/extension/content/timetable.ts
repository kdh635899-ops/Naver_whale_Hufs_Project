// wis.hufs.ac.kr(종합정보시스템) 화면에 주입되는 content script.
// 사용자가 직접 로그인해서 개인시간표 화면을 열면, 화면에 이미 떠 있는 시간표 표를 읽어
// 이 컴퓨터의 storage에만 저장한다. 로그인이나 계정 정보는 다루지 않고, 서버로 보내는 것도 없다.
import { parseTimetable } from "../../services/timetable/parseTimetableTable";
import { getTimetable, saveCaptureStatus, saveTimetable } from "../../storage/timetable";
import { showToast } from "./toast";
import { watchPage } from "./watchPage";

const DEBOUNCE_MS = 500;

async function capture() {
  const result = parseTimetable(document);
  const now = Date.now();

  if (result.status === "no-table") {
    // 개인시간표 화면인데 표를 못 읽은 경우만 기록한다. 다른 화면·프레임에서는 조용히 넘어간다.
    if (/개인시간표|신청학점수/.test(document.body?.textContent ?? "")) {
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

// 표가 나중에 그려지거나(비동기) 학기를 바꿔 다시 그려질 수 있어서, 화면이 바뀔 때마다 조금 기다렸다가 다시 확인한다.
watchPage(capture, DEBOUNCE_MS, "시간표 읽기 실패");
