import { useRef } from "react";
import "./HomeScreen.css";
import logoUrl from "../../assets/logo/wavoo-logo.png";
import { BooCorner } from "../../features/boo/components/BooCorner";
import { setDevTools, useDevTools } from "../../hooks/useDevTools";

const SECRET_TAPS = 5;
const SECRET_WINDOW_MS = 3000;

// 초안 배치: 각자 만든 기능을 우선 이 화면에 붙여 본다. 디자인이 정해지면 배치는 바뀐다.
// 다른 개발자가 채울 자리는 이름 붙은 빈 칸(…Slot)으로 두었다. 자기 기능이 만들어지면 해당 칸의 내용만 교체하면 된다.
function WeeklyCalendarSlot() {
  return (
    <section className="slot calendar-slot" data-slot="weekly-calendar">
      <div className="slot-inner">+</div>
    </section>
  );
}

function OqmaSlot() {
  return (
    <div className="slot tile-slot" data-slot="oqma">
      OQMA
    </div>
  );
}

function ThirdTileSlot() {
  return (
    <div className="slot tile-slot" data-slot="third-tile">
      ?
    </div>
  );
}

function NewsSlot() {
  return (
    <section className="slot news-slot" data-slot="news">
      뉴스 헤더
    </section>
  );
}

export function HomeScreen({ onOpenLinks }: { onOpenLinks: () => void }) {
  const devTools = useDevTools();
  const taps = useRef<number[]>([]);

  // 로고를 3초 안에 5번 누르면 개발 도구(상태 박스·시연 도구)를 켜고 끈다. 일반 사용자에게는 보이지 않는다.
  function onLogoClick() {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < SECRET_WINDOW_MS), now];
    if (taps.current.length >= SECRET_TAPS) {
      taps.current = [];
      void setDevTools(!devTools);
    }
  }

  return (
    <div className="home-screen">
      <header className="wavoo-header">
        <img src={logoUrl} alt="WAVOO" width={140} draggable={false} onClick={onLogoClick} />
      </header>

      <div className="home-body">
        <WeeklyCalendarSlot />

        <div className="tiles">
          <OqmaSlot />
          <button type="button" className="tile-links" onClick={onOpenLinks}>
            링크 모음집
          </button>
          <ThirdTileSlot />
        </div>

        <NewsSlot />
        <BooCorner />
      </div>
    </div>
  );
}
