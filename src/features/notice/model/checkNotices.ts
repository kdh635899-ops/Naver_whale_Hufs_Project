import departments from "../../../constants/departments.json";
import { fetchBoard } from "../../../services/notice/fetchBoard";
import { getKeywords } from "../../../storage/keywords";
import { getNotices, saveCheckStatus, saveNotices } from "../../../storage/notices";
import type { StoredNotice } from "../../../types/notice";
import { mergeNewPosts, type FetchedBoard } from "./mergeNewPosts";

// 학과 선택 설정이 생기기 전까지는 SSAI로 고정한다.
const DEFAULT_DEPARTMENT_ID = "ssai";

function notifyMatches(alerts: StoredNotice[]) {
  const [first] = alerts;
  void chrome.notifications.create({
    type: "basic",
    iconUrl: chrome.runtime.getURL("public/icons/icon128.png"),
    title: alerts.length === 1 ? `새 공지 · ${first.matchedKeywords[0]}` : `키워드 일치 공지 ${alerts.length}건`,
    message: alerts.length === 1 ? first.title : `${first.title} 외 ${alerts.length - 1}건`
  });
}

async function runCheck(now: number): Promise<StoredNotice[]> {
  const department = departments.find((d) => d.id === DEFAULT_DEPARTMENT_ID);
  if (!department) return [];

  // 게시판 하나가 실패해도 나머지는 계속 처리한다.
  const results = await Promise.allSettled(
    department.boards.map(async (board): Promise<FetchedBoard> => ({
      source: board.name,
      posts: await fetchBoard(board.url)
    }))
  );
  const fetched: FetchedBoard[] = [];
  const failedBoards: string[] = [];
  results.forEach((result, i) => {
    const name = department.boards[i].name;
    if (result.status === "fulfilled") {
      fetched.push(result.value);
    } else {
      failedBoards.push(name);
      console.warn(`[notice] ${name} 확인 실패`, result.reason);
    }
  });
  if (fetched.length === 0) {
    await saveCheckStatus({ at: now, added: 0, failedBoards });
    return [];
  }

  const [stored, keywords] = await Promise.all([getNotices(), getKeywords()]);
  const { merged, added } = mergeNewPosts({ stored, fetched, keywords, now });
  await saveNotices(merged);
  await saveCheckStatus({ at: now, added: added.length, failedBoards });

  // 키워드가 일치한 안 읽은 글이 있으면 알림은 한 번만 띄운다.
  const alerts = added.filter((n) => !n.read && n.matchedKeywords.length > 0);
  if (alerts.length > 0) notifyMatches(alerts);

  return added;
}

// 알람·웨일 시작·수동 실행이 겹쳐도 저장소를 동시에 고치지 않도록 한 번에 하나만 돌린다.
let running: Promise<StoredNotice[]> | null = null;

export function checkNotices(now: number = Date.now()): Promise<StoredNotice[]> {
  running ??= runCheck(now).finally(() => {
    running = null;
  });
  return running;
}
