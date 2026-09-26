// service worker에는 DOMParser가 없어서, 정규식 파싱에 필요한 HTML 텍스트 정리를 여기에 모아둔다.
const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " "
};

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (whole, body: string) => {
    if (body[0] === "#") {
      const code = body[1].toLowerCase() === "x" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? whole;
  });
}

/** 태그를 지우고 HTML 문자를 변환한 뒤 공백을 정리한다. */
export function cleanText(innerHtml: string): string {
  return decodeEntities(innerHtml.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}
