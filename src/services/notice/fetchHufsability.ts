import type { FetchedBoard } from "../../types/notice";
import { HUFSABILITY_HOME, parseHufsability } from "./parseHufsability";

// 훕스어빌리티 공개 화면(탭 4개)을 받아 글 목록으로 바꾼다.
export async function fetchHufsability(): Promise<FetchedBoard[]> {
  // 로그인 쿠키를 보내지 않아서, 사용자의 로그인 여부와 상관없이 항상 같은 "로그인 전" 화면을 받는다.
  const res = await fetch(HUFSABILITY_HOME, { credentials: "omit" });
  if (!res.ok) {
    throw new Error(`훕스어빌리티 요청 실패: ${res.status}`);
  }
  const boards = parseHufsability(await res.text());

  // 글을 하나도 못 찾았다면 "새 글 없음"이 아니라 화면 구조가 바뀐 것이므로 실패로 알린다.
  if (boards.every((board) => board.posts.length === 0)) {
    throw new Error("훕스어빌리티 공개 화면에서 공지를 찾지 못했어요 (화면 구조가 바뀌었을 수 있어요)");
  }
  return boards;
}
