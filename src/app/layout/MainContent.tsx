import { useState } from "react";
import { LinksPage } from "../../features/links/pages/LinksPage";
import type { Screen } from "../routes";
import { HomeScreen } from "./HomeScreen";

// 현재 화면을 보여준다. 메인 화면에서 타일을 누르면 각 기능 화면으로 이동하고, ← 로 돌아온다.
export function MainContent() {
  const [screen, setScreen] = useState<Screen>("home");

  return (
    <main style={{ flex: 1 }}>
      {screen === "links" ? <LinksPage onBack={() => setScreen("home")} /> : <HomeScreen onOpenLinks={() => setScreen("links")} />}
    </main>
  );
}
