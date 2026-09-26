// 로그인된 훕스어빌리티 화면에서, 알림함에 있는 공고의 진짜 링크를 찾는다.
// 로그인 전 공개 화면의 공고에는 주소가 없어서(href="#"), 사용자가 로그인해 대시보드를 열었을 때 화면에서 배운다.

export interface LinkableNotice {
  id: string;
  title: string;
}

export interface LinkLearning {
  /** 공고 id -> 진짜 링크 */
  links: Record<string, string>;
  /** 이 화면에서 제목을 찾은 공고 id. 이 공고들은 새 결과가 기존 기록보다 우선한다 */
  matchedIds: string[];
  status: {
    /** 화면에서 제목이 일치한 공고 수 */
    matched: number;
    /** 그중 공고별 진짜 주소를 찾은 수 */
    linked: number;
    /** 제목은 찾았지만 주소가 없고 클릭 시 스크립트로만 이동하는 수 */
    scriptOnly: number;
    /** 여러 공고가 같은 주소를 가리켜서(공고별 링크가 아니라고 보고) 제외한 수 */
    generic: number;
    /** 연결된 링크 예시 */
    example?: string;
    /** 제외된 공통 주소 예시 */
    genericUrl?: string;
    /** 주소가 없는 항목의 모양 예시 (원인 파악용) */
    sample?: string;
  };
}

const normalize = (text: string) => text.replace(/\s+/g, " ").trim();

function realUrl(href: string | null, baseUrl: string): string | null {
  // "#", "#탭이름", "javascript:..."는 다른 화면으로 가는 주소가 아니다.
  if (!href || href.startsWith("#") || /^\s*javascript:/i.test(href)) return null;
  try {
    const url = new URL(href, baseUrl);
    return url.protocol === "https:" && url.hostname.endsWith("hufs.ac.kr") ? url.toString() : null;
  } catch {
    return null;
  }
}

export function learnLinks(doc: Document, notices: LinkableNotice[], baseUrl: string): LinkLearning {
  // 링크(<a>)와 클릭 처리가 붙은 요소만 후보로 본다. 화면에서 "…"로 잘려 보여도 DOM에는 전체 제목이 있다.
  const candidates = Array.from(doc.querySelectorAll("a, [onclick]")).map((element) => ({
    element,
    text: normalize(element.textContent ?? "")
  }));

  const links: Record<string, string> = {};
  const matchedIds: string[] = [];
  let matched = 0;
  let scriptOnly = 0;
  let sample: string | undefined;

  for (const notice of notices) {
    const title = normalize(notice.title);
    if (!title) continue;

    // 제목을 포함한 요소 중 가장 작은 것(제목에 가장 가까운 링크)을 고른다. 목록 전체를 감싼 큰 링크를 피하기 위해서다.
    let found: (typeof candidates)[number] | undefined;
    for (const c of candidates) {
      if (c.text !== "" && c.text.includes(title) && (!found || c.text.length < found.text.length)) found = c;
    }
    if (!found) continue;
    matched++;
    matchedIds.push(notice.id);

    const url = realUrl(found.element.getAttribute("href"), baseUrl);
    if (url) {
      links[notice.id] = url;
    } else {
      scriptOnly++;
      sample ??= normalize(found.element.outerHTML).slice(0, 200);
    }
  }

  // 서로 다른 공고가 같은 주소를 가리키면 공고별 링크가 아니라 목록·첫 화면 같은 공통 주소다.
  const idsByUrl = new Map<string, string[]>();
  for (const [id, url] of Object.entries(links)) idsByUrl.set(url, [...(idsByUrl.get(url) ?? []), id]);
  let generic = 0;
  let genericUrl: string | undefined;
  for (const [url, ids] of idsByUrl) {
    if (ids.length < 2) continue;
    ids.forEach((id) => delete links[id]);
    generic += ids.length;
    genericUrl ??= url;
  }

  const linkedUrls = Object.values(links);
  return {
    links,
    matchedIds,
    status: {
      matched,
      linked: linkedUrls.length,
      scriptOnly,
      generic,
      ...(linkedUrls[0] && { example: linkedUrls[0] }),
      ...(genericUrl && { genericUrl }),
      ...(sample && { sample })
    }
  };
}
