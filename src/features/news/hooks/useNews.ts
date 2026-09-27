import { useCallback, useEffect, useState } from "react";
import { fetchDepartmentNews } from "../../../services/news/newsFeedService";
import {
  getDepartmentNewsCache,
  getNewsPreferences,
  saveDepartmentNewsCache,
  saveNewsPreferences,
} from "../../../storage/news/newsStorage";
import type { Department, DepartmentFeed, NewsPreferences } from "../model/types";

const CACHE_TTL_MS = 30 * 60 * 1000; // 30분
const DEFAULT_PREFERENCES: NewsPreferences = { major: "english", second: "business" };
const EMPTY_FEED: DepartmentFeed = { items: [], fetchedAt: null, loading: true, error: null };

function isFresh(fetchedAt: string): boolean {
  return Date.now() - Date.parse(fetchedAt) < CACHE_TTL_MS;
}

export function useNews() {
  const [preferences, setPreferences] = useState<NewsPreferences | null>(null);
  const [isFirstRun, setIsFirstRun] = useState(false);
  const [feeds, setFeeds] = useState<Partial<Record<Department, DepartmentFeed>>>({});

  useEffect(() => {
    getNewsPreferences()
      .then((saved) => {
        setPreferences(saved ?? DEFAULT_PREFERENCES);
        setIsFirstRun(saved === null);
      })
      .catch((error) => {
        console.error("[wavoo/news] 전공 설정을 불러오지 못했습니다.", error);
        setPreferences(DEFAULT_PREFERENCES);
      });
  }, []);

  const updateFeed = useCallback((department: Department, patch: Partial<DepartmentFeed>) => {
    setFeeds((prev) => ({ ...prev, [department]: { ...(prev[department] ?? EMPTY_FEED), ...patch } }));
  }, []);

  // 1) cache가 있으면 먼저 보여주고 2) 30분 안쪽이면 끝, 3) 아니면 RSS를 받아 교체한다.
  // RSS가 실패해도 기존 items는 지우지 않는다 (error만 표시).
  const loadDepartment = useCallback(
    async (department: Department, force: boolean) => {
      updateFeed(department, { loading: true, error: null });

      let cached = null;
      try {
        cached = await getDepartmentNewsCache(department);
      } catch (error) {
        console.error("[wavoo/news] 뉴스 cache를 읽지 못했습니다.", error);
      }
      if (cached) updateFeed(department, { items: cached.items, fetchedAt: cached.fetchedAt });
      if (cached && !force && isFresh(cached.fetchedAt)) {
        updateFeed(department, { loading: false });
        return;
      }

      try {
        const items = await fetchDepartmentNews(department);
        // 새 결과가 0개면 기존 기사를 비우지 않고 갱신 시각만 바꾼다.
        const entry = { items: items.length > 0 ? items : cached?.items ?? [], fetchedAt: new Date().toISOString() };
        updateFeed(department, { ...entry, loading: false });
        await saveDepartmentNewsCache(department, entry).catch((error) =>
          console.error("[wavoo/news] 뉴스 cache를 저장하지 못했습니다.", error)
        );
      } catch (error) {
        console.error(`[wavoo/news] ${department} 뉴스를 가져오지 못했습니다.`, error);
        updateFeed(department, { loading: false, error: "뉴스를 가져오지 못했어요" });
      }
    },
    [updateFeed]
  );

  // 같은 전공을 두 번 고른 경우 한 번만 불러온다.
  const departments: Department[] = preferences ? [...new Set([preferences.major, preferences.second])] : [];
  const departmentsKey = departments.join(",");

  useEffect(() => {
    if (!departmentsKey) return;
    const list = departmentsKey.split(",") as Department[];
    list.forEach((department) => void loadDepartment(department, false));
    // 사이드바를 오래 열어 둔 경우에도 TTL마다 자동 갱신한다.
    const timer = setInterval(() => list.forEach((d) => void loadDepartment(d, false)), CACHE_TTL_MS);
    return () => clearInterval(timer);
  }, [departmentsKey, loadDepartment]);

  function refresh() {
    departments.forEach((department) => void loadDepartment(department, true));
  }

  async function changePreferences(next: NewsPreferences) {
    setPreferences(next);
    setIsFirstRun(false);
    try {
      await saveNewsPreferences(next);
    } catch (error) {
      // 저장이 안 돼도 이번 세션 화면에는 반영한다.
      console.error("[wavoo/news] 전공 설정을 저장하지 못했습니다.", error);
    }
  }

  return {
    preferences,
    isFirstRun,
    departments,
    getFeed: (department: Department) => feeds[department] ?? EMPTY_FEED,
    refresh,
    changePreferences,
  };
}
