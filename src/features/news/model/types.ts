export const DEPARTMENTS = ["english", "japanese", "chinese", "business"] as const;

export type Department = (typeof DEPARTMENTS)[number];

export interface NewsItem {
  id: string; // RSS guid (없으면 url)
  title: string; // 언론사 suffix(" - 언론사")를 뗀 제목
  source: string; // 언론사
  url: string;
  publishedAt: string; // ISO string: storage에 Date 객체를 넣지 않는다.
  department: Department;
}

export interface NewsPreferences {
  major: Department; // 주전공
  second: Department; // 이중전공 / 부전공
}

// 전공 하나의 뉴스 cache 한 칸.
export interface DepartmentNewsCache {
  items: NewsItem[];
  fetchedAt: string; // ISO string
}

// 화면에 보여줄 전공 하나의 상태.
export interface DepartmentFeed {
  items: NewsItem[];
  fetchedAt: string | null;
  loading: boolean;
  error: string | null;
}
