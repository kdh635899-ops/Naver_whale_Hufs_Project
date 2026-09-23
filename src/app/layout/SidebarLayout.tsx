import { Header } from "./Header";
import { MainContent } from "./MainContent";
import { BottomNavigation } from "./BottomNavigation";

// 5개 탭(OQMA/공지/링크/뉴스/BOO)을 감싸는 최상위 사이드바 프레임.
// 각 탭의 실제 화면은 features/*/pages 에서 구현하고 routes에서 연결한다.
export function SidebarLayout() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header />
      <MainContent />
      <BottomNavigation />
    </div>
  );
}
