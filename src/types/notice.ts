export interface BoardPost {
  /** 게시글 고유 키: `${사이트}:${게시판번호}:${글번호}` (예: ssai:2104:266290) */
  id: string;
  title: string;
  /** 작성일, ISO 형식 (YYYY-MM-DD) */
  date: string;
  /** 게시글 상세 페이지 절대 주소 */
  url: string;
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

/** 가장 최근 공지 확인의 결과 (알람이든 수동이든) */
export interface NoticeCheckStatus {
  at: number;
  added: number;
  /** 가져오지 못한 게시판 이름 */
  failedBoards: string[];
}
