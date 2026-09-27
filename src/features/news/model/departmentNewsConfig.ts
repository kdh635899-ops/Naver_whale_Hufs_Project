import type { Department } from "./types";

export interface DepartmentNewsConfig {
  label: string;
  // Google News 검색 query. 각 query 결과를 합친 뒤 필터링한다.
  queries: string[];
  // 제목에 포함되면 관련도 +1 (여러 개면 누적).
  includeKeywords: string[];
  // 제목에 포함되면 관련도 -2. 전공 관심사와 거리가 먼 기사(스포츠 등)를 걸러낸다.
  excludeKeywords: string[];
}

// 전공과 무관하게 홈 headline으로 부적절한 주제.
const COMMON_EXCLUDE = ["야구", "축구", "농구", "배구", "골프", "MLB", "NBA", "EPL", "KBO", "K리그", "프리미어리그", "부고", "운세"];

// MVP 초기값. 뉴스 품질을 보면서 이 파일만 고치면 된다.
export const departmentNewsConfig: Record<Department, DepartmentNewsConfig> = {
  english: {
    label: "영어",
    queries: [
      '"미국 사회" OR "영국 사회" OR "영어권 문화" when:3d',
      '"미국 문화" OR "영국 문화" OR "영미권" when:7d',
    ],
    includeKeywords: ["미국", "영국", "영어", "영미", "영어권", "호주", "캐나다", "뉴욕", "런던", "워싱턴", "할리우드"],
    excludeKeywords: COMMON_EXCLUDE,
  },
  japanese: {
    label: "일본어",
    queries: ['"일본 사회" OR "일본 문화" when:3d', '"일본 경제" OR "일본 기업" when:3d'],
    includeKeywords: ["일본", "도쿄", "오사카", "교토", "일본어", "한일", "엔화", "엔저", "닛케이"],
    excludeKeywords: COMMON_EXCLUDE,
  },
  chinese: {
    label: "중국어",
    queries: ['"중국 사회" OR "중국 문화" OR "중화권" when:3d', '"중국 경제" OR "중국 기업" when:3d'],
    includeKeywords: ["중국", "중화", "베이징", "상하이", "홍콩", "대만", "중국어", "한중", "위안", "시진핑"],
    excludeKeywords: COMMON_EXCLUDE,
  },
  business: {
    label: "경영학",
    queries: [
      '"기업 경영" OR "마케팅 전략" OR "스타트업" when:3d',
      '"산업 동향" OR "금융 시장" OR "기업 실적" when:3d',
    ],
    includeKeywords: ["기업", "경영", "마케팅", "스타트업", "산업", "금융", "실적", "투자", "매출", "시장", "증시", "CEO", "브랜드"],
    excludeKeywords: COMMON_EXCLUDE,
  },
};
