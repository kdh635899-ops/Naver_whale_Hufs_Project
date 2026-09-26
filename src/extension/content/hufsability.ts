// hufsability.hufs.ac.kr 화면에 주입되는 content script.
// 사용자가 직접 로그인해서 대시보드를 열면, 화면에 이미 떠 있는 공고의 링크를 읽어 이 컴퓨터에만 기억해 둔다.
// 알림함에서 그 공고를 누르면 첫 화면 대신 그 공고로 바로 이동하기 위해서다. 로그인 정보는 다루지 않는다.
import { learnLinks } from "../../services/notice/learnHufsabilityLinks";
import { getLearnedLinks, getNotices, saveLearnedLinks, saveLinkStatus } from "../../storage/notices";
import { HAB_LINK_STATUS_KEY } from "../../storage/notices";
import type { LinkLearningStatus } from "../../types/notice";

const DEBOUNCE_MS = 600;

const isLoggedIn = () => /LOGOUT|로그아웃/.test(document.body?.textContent ?? "");

async function learn() {
  // 로그인 전 화면의 공고는 주소가 없으므로 배울 것이 없다.
  if (!isLoggedIn()) return;

  const notices = (await getNotices()).filter((n) => n.id.startsWith("hufsability:"));
  if (notices.length === 0) return;

  const { links, status } = learnLinks(document, notices, location.href);
  if (status.matched === 0) return; // 공고가 없는 화면(다른 메뉴)은 조용히 넘어간다

  const previous = await getLearnedLinks();
  const currentIds = new Set(notices.map((n) => n.id));
  const merged = Object.fromEntries(Object.entries({ ...previous, ...links }).filter(([id]) => currentIds.has(id)));
  if (JSON.stringify(merged) !== JSON.stringify(previous)) await saveLearnedLinks(merged);

  const stored = (await chrome.storage.local.get(HAB_LINK_STATUS_KEY))[HAB_LINK_STATUS_KEY] as LinkLearningStatus | undefined;
  const same = stored && stored.matched === status.matched && stored.linked === status.linked && stored.scriptOnly === status.scriptOnly && stored.sample === status.sample;
  if (!same) await saveLinkStatus({ at: Date.now(), ...status });
}

let timer: ReturnType<typeof setTimeout> | undefined;

// 공고 목록이 나중에 그려질 수 있어서, 화면이 바뀔 때마다 조금 기다렸다가 다시 확인한다.
function schedule() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    learn().catch((error) => console.warn("[WAVOO] 훕스어빌리티 링크 학습 실패", error));
  }, DEBOUNCE_MS);
}

new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
schedule();
