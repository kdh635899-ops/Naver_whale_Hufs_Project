import { NoticePage } from "../../features/notice/pages/NoticePage";

// 현재 선택된 탭의 페이지가 여기에 렌더링된다.
// 탭 네비게이션(routes)이 생기기 전까지는 공지 페이지를 임시로 바로 보여준다.
export function MainContent() {
  return (
    <main style={{ flex: 1 }}>
      <NoticePage />
    </main>
  );
}
