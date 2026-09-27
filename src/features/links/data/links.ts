export interface SchoolLink {
  id: string;
  name: string;
  url: string;
  /** 학교가 운영하는 사이트가 아닌 경우 화면에 "비공식"으로 표시한다 */
  unofficial?: boolean;
}

export interface LinkGroup {
  title: string;
  links: SchoolLink[];
}

// 임시 목록이다. 최종 사이트 목록이 정해지면 이 파일만 고치면 된다. (접속되는 주소만 넣는다)
// 이름은 학교 사이트의 표기를 따른다 (예: e-class(LMS), 수강편람(서울)).
export const LINK_GROUPS: LinkGroup[] = [
  {
    title: "학사",
    links: [
      { id: "wis", name: "종합정보시스템", url: "https://wis.hufs.ac.kr/src08/jsp/index.jsp" },
      { id: "eclass", name: "e-class(LMS)", url: "https://eclass.hufs.ac.kr/ilos/main/main_form.acl" },
      { id: "timetable", name: "강의시간표 조회", url: "https://wis.hufs.ac.kr/src08/jsp/lecture/LECTURE2020L.jsp" },
      { id: "catalog-seoul", name: "수강편람(서울)", url: "https://wis.hufs.ac.kr/jsp/HUFS/seb/listCourseCatalog.jsp?campusGb=H1" },
      { id: "catalog-global", name: "수강편람(글로벌)", url: "https://wis.hufs.ac.kr/jsp/HUFS/seb/listCourseCatalog.jsp?campusGb=H2" },
      { id: "calendar", name: "학사일정", url: "https://www.hufs.ac.kr/hufs/11360/subview.do" },
      // 로그인해야 보이는 화면이다. 로그아웃 상태면 종합정보시스템이 로그인 화면으로 안내한다. (메뉴 "성적취득현황"의 주소)
      { id: "grades", name: "성적 취득 현황", url: "https://wis.hufs.ac.kr/src08/jsp/grade/GRADE1030L_Main.jsp?tab_lang=K" },
      { id: "certificate", name: "재학증명서 발급", url: "https://unc.doculink.co.kr/index/choice.do" }
    ]
  },
  {
    title: "나의 활동",
    links: [
      { id: "hufsability", name: "훕스어빌리티", url: "https://hufsability.hufs.ac.kr/" },
      { id: "job", name: "진로취업센터", url: "https://job.hufs.ac.kr/job/main/index.do" },
      { id: "counsel", name: "학생상담센터", url: "https://sccs.hufs.ac.kr/" },
      { id: "scholarship", name: "장학 안내", url: "https://www.hufs.ac.kr/hufs/11283/subview.do" }
    ]
  },
  {
    title: "학생 서비스",
    links: [
      { id: "everytime", name: "에브리타임", url: "https://everytime.kr/", unofficial: true },
      { id: "hanmo", name: "한모(모의수강신청)", url: "https://vsugangpractice.com/", unofficial: true }
    ]
  },
  {
    title: "생활",
    links: [
      { id: "mail", name: "HUFS 메일", url: "https://mail.hufs.ac.kr/" },
      { id: "office365", name: "Office365", url: "https://office.hufs.ac.kr/ASP2/Default.aspx" },
      { id: "library-seoul", name: "도서관(서울)", url: "https://lib.hufs.ac.kr/" },
      { id: "library-global", name: "도서관(글로벌)", url: "https://lib.hufs.ac.kr/global/" },
      { id: "cafeteria", name: "학식 메뉴", url: "https://www.hufs.ac.kr/hufs/11318/subview.do" },
      { id: "dorm", name: "기숙사", url: "https://www.hufs.ac.kr/hufs/11313/subview.do" },
      { id: "map", name: "캠퍼스 맵", url: "https://www.hufs.ac.kr/hufs/11464/subview.do" }
    ]
  },
  {
    title: "학교",
    links: [
      { id: "home", name: "학교 홈페이지", url: "https://www.hufs.ac.kr/hufs/index.do" },
      { id: "international", name: "국제교류", url: "https://hufsia.hufs.ac.kr/" }
    ]
  }
];

/** 나만의 링크 칸에서 id로 링크를 찾을 때 쓴다 */
export const ALL_LINKS: SchoolLink[] = LINK_GROUPS.flatMap((group) => group.links);
