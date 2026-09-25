import type { BoardPost } from "../../types/notice";
import { parseBoard } from "./parseBoard";

// 게시판 목록 페이지를 받아 글 목록(최신순 1페이지)으로 바꾼다.
// host_permissions에 등록된 도메인이어야 fetch가 허용된다 (manifest.json 참고).
export async function fetchBoard(boardUrl: string): Promise<BoardPost[]> {
  const res = await fetch(boardUrl);
  if (!res.ok) {
    throw new Error(`게시판 요청 실패: ${res.status} ${boardUrl}`);
  }
  const html = await res.text();
  return parseBoard(html, new URL(boardUrl).origin);
}
