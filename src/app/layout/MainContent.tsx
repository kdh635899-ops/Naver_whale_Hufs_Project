import { BooHome } from "../../features/boo/pages/BooHome";

// 현재 선택된 탭의 페이지가 여기에 렌더링된다.
// 탭 네비게이션(routes)이 생기기 전까지는 BOO 메인 화면을 임시로 바로 보여준다.
export function MainContent() {
  return (
    <main style={{ flex: 1 }}>
      <BooHome />
    </main>
  );
}
