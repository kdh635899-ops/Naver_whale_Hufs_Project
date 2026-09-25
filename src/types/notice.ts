export interface BoardPost {
  /** 게시글 고유 키: `${사이트}:${게시판번호}:${글번호}` (예: ssai:2104:266290) */
  id: string;
  title: string;
  /** 작성일, ISO 형식 (YYYY-MM-DD) */
  date: string;
  /** 게시글 상세 페이지 절대 주소 */
  url: string;
}
