import type { BooMood } from "../logic/bubbleMessage";

// 임시 캐릭터(유령). 학교의 공식 BOO 이미지 사용 승인이 나면 이 컴포넌트 안쪽만 교체한다.
export function BooCharacter({ mood }: { mood: BooMood }) {
  return (
    <svg className={`boo-character ${mood}`} viewBox="0 0 120 120" width="120" height="120" aria-hidden="true">
      <path
        d="M60 12c-24 0-40 18-40 42v40c0 6 5 10 11 10 5 0 7-6 12-6s7 6 12 6 7-6 12-6 7 6 12 6c6 0 11-4 11-10V54c0-24-16-42-40-42z"
        fill="#bfe6ec"
        stroke="#0f6e7d"
        strokeWidth="3"
      />
      <circle cx="46" cy="54" r="5.5" fill="#12323a" />
      <circle cx="74" cy="54" r="5.5" fill="#12323a" />
      <ellipse cx="38" cy="66" rx="6" ry="3.5" fill="#f4a6b0" opacity="0.8" />
      <ellipse cx="82" cy="66" rx="6" ry="3.5" fill="#f4a6b0" opacity="0.8" />
      <path d="M53 68q7 7 14 0" fill="none" stroke="#12323a" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
