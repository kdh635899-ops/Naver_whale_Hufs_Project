import owlUrl from "../../../assets/boo/owl.png";
import type { BooMood } from "../logic/bubbleMessage";

// 초안 디자인의 부엉이. 최종 캐릭터·애니메이션이 정해지면 이 컴포넌트 안쪽만 교체한다.
// (공식 마스코트 이미지 사용 승인이 필요한 자료다)
export function BooCharacter({ mood }: { mood: BooMood }) {
  return <img className={`boo-character ${mood}`} src={owlUrl} alt="" width={112} draggable={false} />;
}
