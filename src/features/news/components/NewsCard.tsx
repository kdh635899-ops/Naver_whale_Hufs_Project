import type { MouseEvent } from "react";
import { departmentNewsConfig } from "../model/departmentNewsConfig";
import type { Department, DepartmentFeed } from "../model/types";

export function formatRelativeTime(iso: string, now = Date.now()): string {
  const minutes = Math.max(0, Math.floor((now - Date.parse(iso)) / 60_000));
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  if (minutes < 60 * 24) return `${Math.floor(minutes / 60)}시간 전`;
  return `${Math.floor(minutes / (60 * 24))}일 전`;
}

// 사이드바 안에서 이동하지 않고 새 브라우저 탭으로 연다.
// (vite dev 서버처럼 chrome.tabs가 없는 환경에서는 window.open으로 대체)
function openArticle(event: MouseEvent<HTMLAnchorElement>, url: string) {
  event.preventDefault();
  if (typeof chrome !== "undefined" && chrome.tabs?.create) {
    void chrome.tabs.create({ url });
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

interface NewsCardProps {
  department: Department;
  role: string; // "주전공" / "이중·부전공"
  feed: DepartmentFeed;
  limit: number;
}

export function NewsCard({ department, role, feed, limit }: NewsCardProps) {
  const items = feed.items.slice(0, limit);

  return (
    <div className="wavoo-news-card">
      <div className="wavoo-news-card-label">
        {departmentNewsConfig[department].label}
        <span className="wavoo-news-card-role">{role}</span>
      </div>

      {items.length > 0 ? (
        <ul className="wavoo-news-list">
          {items.map((item) => (
            <li key={item.id}>
              <a
                className="wavoo-news-headline"
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => openArticle(event, item.url)}
              >
                {item.title}
              </a>
              <div className="wavoo-news-meta">
                {item.source} · {formatRelativeTime(item.publishedAt)}
              </div>
            </li>
          ))}
        </ul>
      ) : feed.loading ? (
        <p className="wavoo-news-status">뉴스를 불러오는 중…</p>
      ) : feed.error ? (
        <p className="wavoo-news-status wavoo-news-status-error">{feed.error}</p>
      ) : (
        <p className="wavoo-news-status">최근 관련 뉴스가 없어요</p>
      )}

      {items.length > 0 && feed.error && (
        <p className="wavoo-news-status wavoo-news-status-error">업데이트 실패 · 이전 뉴스를 보여주고 있어요</p>
      )}
    </div>
  );
}
