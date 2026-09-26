import type { BoardPost } from "../../types/notice";
import { cleanText } from "../../utils/html";

// 외대 학과 홈페이지 게시판(artclList) 공통 구조를 읽는다.
// background(service worker)에는 DOMParser가 없어서 정규식으로 파싱한다.
// 학교가 게시판 마크업을 바꾸면 이 파일만 고치면 되도록 파싱 규칙을 여기에 모아둔다.

const ROW_RE = /<tr\b[^>]*>([\s\S]*?)<\/tr>/g;
const LINK_RE =
  /<a\s[^>]*href="(\/bbs\/([\w-]+)\/(\d+)\/(\d+)\/artclView\.do)"[^>]*>([\s\S]*?)<\/a>/;
const DATE_RE = /class="td-date">\s*(\d{4})\.(\d{2})\.(\d{2})\s*</;

function cleanTitle(innerHtml: string): string {
  return cleanText(innerHtml.replace(/<span\b[^>]*>[\s\S]*?<\/span>/gi, "")); // "새글" 배지 등
}

export function parseBoard(html: string, origin: string): BoardPost[] {
  const posts: BoardPost[] = [];

  for (const row of html.matchAll(ROW_RE)) {
    const body = row[1];
    if (!body.includes("td-subject")) continue;

    const link = body.match(LINK_RE);
    const date = body.match(DATE_RE);
    if (!link || !date) continue;

    const [, path, site, boardId, postId, inner] = link;
    const title = cleanTitle(inner);
    if (!title) continue;

    posts.push({
      id: `${site}:${boardId}:${postId}`,
      title,
      date: `${date[1]}-${date[2]}-${date[3]}`,
      url: new URL(path, origin).toString()
    });
  }

  return posts;
}
