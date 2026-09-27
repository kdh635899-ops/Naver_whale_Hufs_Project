import { departmentNewsConfig } from "../../features/news/model/departmentNewsConfig";
import type { Department, NewsItem } from "../../features/news/model/types";

const GOOGLE_NEWS_RSS = "https://news.google.com/rss/search";
const FETCH_TIMEOUT_MS = 10_000;
const HOUR_MS = 60 * 60 * 1000;
const FRESH_WINDOW_MS = 72 * HOUR_MS; // 우선 72시간 이내 기사
const FALLBACK_WINDOW_MS = 7 * 24 * HOUR_MS; // 부족하면 7일까지
const MIN_ITEMS = 3; // 이보다 적으면 조건을 한 단계 완화한다.
const MAX_CACHED_ITEMS = 20;

export function buildRssUrl(query: string): string {
  const params = new URLSearchParams({ q: query, hl: "ko", gl: "KR", ceid: "KR:ko" });
  return `${GOOGLE_NEWS_RSS}?${params}`;
}

// Google News 제목은 "기사 제목 - 언론사" 형태라서 언론사 suffix를 뗀다.
// 가끔 "제목 - 머니투데이 - 머니투데이"처럼 두 번 붙어 오므로 반복해서 뗀다.
function stripSourceSuffix(title: string, source: string): string {
  const suffix = ` - ${source}`;
  let stripped = title;
  while (source && stripped.endsWith(suffix)) stripped = stripped.slice(0, -suffix.length).trim();
  return stripped;
}

// description(HTML)은 쓰지 않고 guid/title/link/pubDate/source만 텍스트로 읽는다.
export function parseRss(xml: string, department: Department): NewsItem[] {
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  if (doc.querySelector("parsererror")) throw new Error("RSS XML을 해석하지 못했습니다.");

  return Array.from(doc.querySelectorAll("item")).flatMap((item) => {
    const text = (tag: string) => item.querySelector(tag)?.textContent?.trim() ?? "";
    const url = text("link");
    const source = text("source");
    const title = stripSourceSuffix(text("title"), source);
    const publishedAt = new Date(text("pubDate"));

    // 외부 데이터이므로 http(s) 링크와 유효한 날짜만 받는다.
    if (!title || !/^https?:\/\//.test(url) || Number.isNaN(publishedAt.getTime())) return [];

    return [
      {
        id: text("guid") || url,
        title,
        source: source || "언론사 미상",
        url,
        publishedAt: publishedAt.toISOString(),
        department,
      },
    ];
  });
}

export function normalizeTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+-\s+[^-]+$/, "") // 남아 있는 " - 언론사" suffix
    .replace(/[^\p{L}\p{N}]+/gu, ""); // 공백·문장부호 차이 무시
}

// guid → URL → 정규화 제목 순으로, 하나라도 이미 본 값이면 중복으로 본다.
export function dedupeNews(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const keys = [`id:${item.id}`, `url:${item.url}`, `title:${normalizeTitle(item.title)}`];
    if (keys.some((key) => seen.has(key))) return false;
    keys.forEach((key) => seen.add(key));
    return true;
  });
}

export function scoreRelevance(title: string, department: Department): number {
  const { includeKeywords, excludeKeywords } = departmentNewsConfig[department];
  const lower = title.toLowerCase();
  const hits = (keywords: string[]) => keywords.filter((k) => lower.includes(k.toLowerCase())).length;
  return hits(includeKeywords) - 2 * hits(excludeKeywords);
}

// dedupe → 최신성 창(72h, 부족하면 7일) → 관련성(>0, 부족하면 >=0) → 최신순 정렬.
// 각 단계는 결과가 너무 적을 때만 완화해서 과도한 filtering을 막는다.
export function selectRelevantNews(items: NewsItem[], department: Department, now = Date.now()): NewsItem[] {
  const unique = dedupeNews(items);
  const withinWindow = (windowMs: number) =>
    unique.filter((item) => now - Date.parse(item.publishedAt) <= windowMs);

  const fresh = withinWindow(FRESH_WINDOW_MS);
  const pool = fresh.length >= MIN_ITEMS ? fresh : withinWindow(FALLBACK_WINDOW_MS);

  const scored = pool.map((item) => ({ item, score: scoreRelevance(item.title, department) }));
  const relevant = scored.filter(({ score }) => score > 0);
  const picked = relevant.length >= MIN_ITEMS ? relevant : scored.filter(({ score }) => score >= 0);

  return picked
    .map(({ item }) => item)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, MAX_CACHED_ITEMS);
}

async function fetchQuery(query: string, department: Department): Promise<NewsItem[]> {
  const response = await fetch(buildRssUrl(query), { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!response.ok) throw new Error(`Google News RSS 요청 실패 (${response.status})`);
  return parseRss(await response.text(), department);
}

// query 하나가 실패해도 나머지 결과로 진행하고, 전부 실패했을 때만 throw한다.
export async function fetchDepartmentNews(department: Department): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    departmentNewsConfig[department].queries.map((query) => fetchQuery(query, department))
  );
  const succeeded = results.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
  if (succeeded.length === 0) throw (results[0] as PromiseRejectedResult).reason;
  return selectRelevantNews(succeeded.flat(), department);
}
