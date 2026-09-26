export interface SchoolLink {
  id: string;
  name: string;
  url: string;
}

export interface LinkGroup {
  title: string;
  links: SchoolLink[];
}

// 임시 목록이다. 최종 사이트 목록이 정해지면 이 파일만 고치면 된다. (접속되는 주소만 넣는다)
export const LINK_GROUPS: LinkGroup[] = [
  {
    title: "학사",
    links: [
      { id: "wis", name: "종합정보시스템", url: "https://wis.hufs.ac.kr/src08/jsp/index.jsp" },
      { id: "timetable", name: "강의시간표 조회", url: "https://wis.hufs.ac.kr/src08/jsp/lecture/LECTURE2020L.jsp" },
      { id: "eclass", name: "e-Class", url: "https://eclass.hufs.ac.kr/ilos/main/main_form.acl" },
      { id: "calendar", name: "학사일정", url: "https://www.hufs.ac.kr/hufs/11360/subview.do" }
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
    title: "생활",
    links: [
      { id: "mail", name: "HUFS 메일", url: "https://mail.hufs.ac.kr/" },
      { id: "office365", name: "Office365", url: "https://office.hufs.ac.kr/ASP2/Default.aspx" },
      { id: "library-seoul", name: "도서관 (서울)", url: "https://lib.hufs.ac.kr/" },
      { id: "library-global", name: "도서관 (글로벌)", url: "https://lib.hufs.ac.kr/global/" },
      { id: "cafeteria", name: "식당 안내", url: "https://www.hufs.ac.kr/hufs/11318/subview.do" },
      { id: "coop", name: "생활협동조합", url: "https://coop.hufs.ac.kr/" },
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
