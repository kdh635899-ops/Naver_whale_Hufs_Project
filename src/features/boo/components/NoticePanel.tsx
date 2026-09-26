import { useEffect, useRef, type ReactNode } from "react";

interface NoticePanelProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

// BOO를 눌렀을 때 사이드바 전체를 덮으며 올라오는 알림함 창 (종 모양 알림처럼).
export function NoticePanel({ open, onClose, children }: NoticePanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="notice-panel" role="dialog" aria-modal="true" aria-label="BOO 알림함">
      <header className="notice-panel-header">
        <strong>BOO 알림함</strong>
        <button ref={closeRef} type="button" aria-label="알림함 닫기" onClick={onClose}>
          ✕
        </button>
      </header>
      <div className="notice-panel-body">{children}</div>
    </div>
  );
}
