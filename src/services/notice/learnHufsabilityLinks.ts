// 로그인된 훕스어빌리티 화면에서, 알림함에 있는 공고의 진짜 링크를 찾는다.
// 로그인 전 공개 화면의 공고에는 주소가 없어서(href="#"), 사용자가 로그인해 대시보드를 열었을 때 화면에서 배운다.

export interface LinkableNotice {
  id: string;
  title: string;
}

export interface LinkLearning {
  /** 공고 id -> 진짜 링크 */
  links: Record<string, string>;
  status: {
    /** 화면에서 제목이 일치한 공고 수 */
    matched: number;
    /** 그중 진짜 주소를 찾은 수 */
    linked: number;
    /** 제목은 찾았지만 주소가 없고 클릭 시 스크립트로만 이동하는 수 */
    scriptOnly: number;
    /** 주소가 없는 항목의 href/onclick 예시 (원인 파악용) */
    sample?: string;
  };
}

const normalize = (text: string) => text.replace(/\s+/g, " ").trim();

function realUrl(href: string | null, baseUrl: string): string | null {
  if (!href || href === "#" || /^\s*javascript:/i.test(href)) return null;
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
  let matched = 0;
  let linked = 0;
  let scriptOnly = 0;
  let sample: string | undefined;

  for (const notice of notices) {
    const title = normalize(notice.title);
    if (!title) continue;
    const found = candidates.find((c) => c.text !== "" && c.text.includes(title));
    if (!found) continue;
    matched++;

    const url = realUrl(found.element.getAttribute("href"), baseUrl);
    if (url) {
      links[notice.id] = url;
      linked++;
    } else {
      scriptOnly++;
      sample ??= normalize(`href=${found.element.getAttribute("href") ?? ""} onclick=${found.element.getAttribute("onclick") ?? ""}`).slice(0, 160);
    }
  }
  return { links, status: { matched, linked, scriptOnly, ...(sample && { sample }) } };
}
