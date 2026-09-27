import { useEffect, useState } from "react";
import "./news.css";
import { useNews } from "../hooks/useNews";
import { departmentNewsConfig } from "../model/departmentNewsConfig";
import { DEPARTMENTS, type Department, type NewsPreferences } from "../model/types";
import { NewsCard, formatRelativeTime } from "./NewsCard";

interface NewsWidgetProps {
  // 홈 공간이 넉넉하면 2로 올린다. cache에는 더 많은 기사가 있다.
  headlinesPerDepartment?: 1 | 2;
}

// WAVOO 홈의 "뉴스 헤더" 영역에 <NewsWidget /> 한 줄로 삽입하는 외부 진입점.
export function NewsWidget({ headlinesPerDepartment = 1 }: NewsWidgetProps) {
  const { preferences, isFirstRun, departments, getFeed, refresh, changePreferences } = useNews();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // 전공을 한 번도 저장한 적이 없으면 설정을 펼쳐서 시작한다.
  useEffect(() => {
    if (isFirstRun) setSettingsOpen(true);
  }, [isFirstRun]);

  if (!preferences) return <section className="wavoo-news-widget" aria-busy="true" />;

  const feeds = departments.map((department) => ({ department, feed: getFeed(department) }));
  const anyLoading = feeds.some(({ feed }) => feed.loading);
  // 가장 오래된 갱신 시각을 기준으로 "마지막 업데이트"를 보여준다.
  const fetchedTimes = feeds.flatMap(({ feed }) => (feed.fetchedAt ? [feed.fetchedAt] : [])).sort();
  const lastUpdated = fetchedTimes[0];

  // 주전공을 현재 두 번째 전공과 같게 바꾸면 두 값을 맞바꿔 서로 다르게 유지한다.
  function selectMajor(current: NewsPreferences, major: Department) {
    const next = major === current.second ? { major, second: current.major } : { ...current, major };
    void changePreferences(next);
  }

  function closeSettings(current: NewsPreferences) {
    setSettingsOpen(false);
    if (isFirstRun) void changePreferences(current); // 기본값 그대로 확정
  }

  return (
    <section className="wavoo-news-widget" aria-label="전공 뉴스">
      <header className="wavoo-news-header">
        <span className="wavoo-news-title">NEWS</span>
        <div className="wavoo-news-actions">
          <button type="button" onClick={refresh} disabled={anyLoading} aria-label="뉴스 새로고침" title="새로고침">
            ↻
          </button>
          <button
            type="button"
            onClick={() => (settingsOpen ? closeSettings(preferences) : setSettingsOpen(true))}
            aria-expanded={settingsOpen}
            aria-label="전공 설정"
            title="전공 설정"
          >
            ⚙️
          </button>
        </div>
      </header>

      {settingsOpen && (
        <div className="wavoo-news-settings">
          {isFirstRun && <p className="wavoo-news-status">전공을 고르면 관련 뉴스를 보여드려요.</p>}
          <label>
            주전공
            <select
              value={preferences.major}
              onChange={(e) => selectMajor(preferences, e.target.value as Department)}
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {departmentNewsConfig[d].label}
                </option>
              ))}
            </select>
          </label>
          <label>
            이중·부전공
            <select
              value={preferences.second}
              onChange={(e) => void changePreferences({ ...preferences, second: e.target.value as Department })}
            >
              {DEPARTMENTS.filter((d) => d !== preferences.major).map((d) => (
                <option key={d} value={d}>
                  {departmentNewsConfig[d].label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="wavoo-news-settings-done" onClick={() => closeSettings(preferences)}>
            완료
          </button>
        </div>
      )}

      {feeds.map(({ department, feed }, index) => (
        <NewsCard
          key={department}
          department={department}
          role={index === 0 ? "주전공" : "이중·부전공"}
          feed={feed}
          limit={headlinesPerDepartment}
        />
      ))}

      <footer className="wavoo-news-footer">
        {anyLoading ? "업데이트 중…" : lastUpdated ? `업데이트 ${formatRelativeTime(lastUpdated)}` : ""}
      </footer>
    </section>
  );
}
