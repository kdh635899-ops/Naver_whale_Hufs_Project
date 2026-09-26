import type { BoardPost, FetchedBoard } from "../../types/notice";
import { cleanText } from "../../utils/html";

// 훕스어빌리티 "로그인 전" 공개 화면의 탭 4개(교내비교과/장학공지/공지사항/채용정보)를 읽는다.
// 항목마다 개별 링크가 없어서(href="#") 글 고유번호가 없다. 탭 + 제목 + 시작일로 ID를 만든다.
// 화면 구조가 바뀌면 이 파일만 고치면 된다.

export const HUFSABILITY_HOME = "https://hufsability.hufs.ac.kr/";

const SITE = "hufsability";
const TAB_KEYS: Record<string, string> = {
  교내비교과: "campus",
  장학공지: "scholarship",
  공지사항: "notice",
  채용정보: "job"
};

const TAB_LABEL_RE = /<a href="#tabCon(\d)">([^<]*)<\/a>/g;
const TAB_START_RE = /<div id="tabCon(\d)" class="tab_cont"/g; // tabCon1_1 같은 안쪽 div는 제외된다
const ITEM_RE =
  /<li class="notice_list">[\s\S]*?<span class="notice_list_title">([\s\S]*?)<\/span>\s*<span class="notice_list_date">([\s\S]*?)<\/span>/g;
// "2026.09.23 00:00~2026.09.30 00:00" 또는 "2026.09.18 10:43"
const PERIOD_RE =
  /^(\d{4})\.(\d{2})\.(\d{2})(?:\s+\d{2}:\d{2})?(?:\s*~\s*(\d{4})\.(\d{2})\.(\d{2})(?:\s+(\d{2}:\d{2}))?)?$/;

function shortHash(text: string): string {
  let hash = 0x811c9dc5; // FNV-1a
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function parseHufsability(html: string): FetchedBoard[] {
  const labels = new Map<string, string>();
  for (const m of html.matchAll(TAB_LABEL_RE)) labels.set(m[1], cleanText(m[2]));

  const starts = [...html.matchAll(TAB_START_RE)].map((m) => ({ index: m[1], at: m.index ?? 0 }));
  const boards: FetchedBoard[] = [];

  starts.forEach(({ index, at }, i) => {
    const label = labels.get(index) ?? `탭${index}`;
    const key = TAB_KEYS[label] ?? `tab${index}`;
    const segment = html.slice(at, starts[i + 1]?.at ?? html.length);
    const posts: BoardPost[] = [];

    for (const item of segment.matchAll(ITEM_RE)) {
      const title = cleanText(item[1]);
      const period = cleanText(item[2]).match(PERIOD_RE);
      if (!title || !period) continue;

      const date = `${period[1]}-${period[2]}-${period[3]}`;
      posts.push({
        id: `${SITE}:${key}:${shortHash(`${title}|${date}`)}`,
        title,
        date,
        ...(period[4] && { deadline: `${period[4]}-${period[5]}-${period[6]}T${period[7] ?? "23:59"}` }),
        url: HUFSABILITY_HOME
      });
    }

    boards.push({ source: `훕스어빌리티 · ${label}`, posts });
  });

  return boards;
}
