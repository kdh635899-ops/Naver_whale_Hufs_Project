export interface BoardPost {
  /** 게시글 고유 키: `${사이트}:${게시판}:${글번호 또는 해시}` (예: ssai:2104:266290) */
  id: string;
  title: string;
  /** 작성일(또는 신청 시작일), ISO 형식 (YYYY-MM-DD) */
  date: string;
  /** 신청·모집 마감 시각, 한국 시간 기준 `YYYY-MM-DDTHH:mm`. 마감이 있는 공지에만 존재 */
  deadline?: string;
  /** 게시글 상세 페이지 절대 주소 (개별 링크가 없는 소스는 해당 사이트 첫 화면) */
  url: string;
}

/** 한 곳(게시판/탭)에서 가져온 글 묶음 */
export interface FetchedBoard {
  source: string;
  posts: BoardPost[];
}

/** 알림함(storage)에 보관되는 공지 */
export interface StoredNotice extends BoardPost {
  /** 출처 게시판 이름 (예: 학사공지사항) */
  source: string;
  /** 확장앱이 처음 발견한 시각 (ms) */
  fetchedAt: number;
  read: boolean;
  /** 발견 당시 등록돼 있던 키워드 중 제목에 포함된 것 */
  matchedKeywords: string[];
}

/** 로그인된 훕스어빌리티 화면에서 공고 링크를 배운 마지막 결과 */
export interface LinkLearningStatus {
  at: number;
  matched: number;
  linked: number;
  scriptOnly: number;
  generic: number;
  example?: string;
  genericUrl?: string;
  sample?: string;
}

/** 가장 최근 공지 확인의 결과 (알람이든 수동이든) */
export interface NoticeCheckStatus {
  at: number;
  added: number;
  /** 가져오지 못한 게시판 이름 */
  failedBoards: string[];
}
