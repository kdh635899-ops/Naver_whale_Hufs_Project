import {
  DEPARTMENTS,
  type Department,
  type DepartmentNewsCache,
  type NewsPreferences,
} from "../../features/news/model/types";

const PREFERENCES_KEY = "wavoo.news.preferences";
const CACHE_KEY = "wavoo.news.cache.v1";

type NewsCache = Partial<Record<Department, DepartmentNewsCache>>;

function isDepartment(value: unknown): value is Department {
  return DEPARTMENTS.includes(value as Department);
}

// calendarStorage와 같은 원칙: read 실패는 삼키지 않고 throw한다.
// 저장된 적이 없거나 형식이 맞지 않으면 null (= 아직 설정 안 함).
export async function getNewsPreferences(): Promise<NewsPreferences | null> {
  const result = await chrome.storage.local.get(PREFERENCES_KEY);
  const saved = result[PREFERENCES_KEY] as Partial<NewsPreferences> | undefined;
  return saved && isDepartment(saved.major) && isDepartment(saved.second)
    ? { major: saved.major, second: saved.second }
    : null;
}

export async function saveNewsPreferences(preferences: NewsPreferences): Promise<void> {
  await chrome.storage.local.set({ [PREFERENCES_KEY]: preferences });
}

async function getNewsCache(): Promise<NewsCache> {
  const result = await chrome.storage.local.get(CACHE_KEY);
  return (result[CACHE_KEY] as NewsCache | undefined) ?? {};
}

export async function getDepartmentNewsCache(department: Department): Promise<DepartmentNewsCache | null> {
  return (await getNewsCache())[department] ?? null;
}

// 두 전공이 동시에 read → 수정 → write 하면 한쪽 결과가 사라지므로 write를 한 줄로 세운다.
let cacheWriteQueue: Promise<unknown> = Promise.resolve();

export function saveDepartmentNewsCache(department: Department, entry: DepartmentNewsCache): Promise<void> {
  const write = cacheWriteQueue.then(async () => {
    const cache = await getNewsCache();
    await chrome.storage.local.set({ [CACHE_KEY]: { ...cache, [department]: entry } });
  });
  cacheWriteQueue = write.catch(() => {}); // 실패는 호출자에게 전달하고, 다음 write는 계속 진행
  return write;
}
