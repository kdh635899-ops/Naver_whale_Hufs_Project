// 페이지 위에 잠깐 떴다 사라지는 안내창. 사이드바 앱이 아니라 사용자가 보고 있는 웹페이지 오른쪽 위에 뜬다.

/** 표가 iframe 안에 있어도 안내창은 맨 위 페이지에 띄운다. 다른 출처라 접근할 수 없으면 이 프레임에 띄운다. */
export function toastWindow(self: Window = window): Window {
  try {
    const top = self.top;
    if (top && top.document) return top;
  } catch {
    // 다른 출처의 프레임: 맨 위 페이지에 접근할 수 없다
  }
  return self;
}

export function showToast(message: string, durationMs = 4000, host: Window = toastWindow()) {
  const doc = host.document;
  if (!doc.body) return;

  const toast = doc.createElement("div");
  toast.textContent = message;
  toast.setAttribute("role", "status");
  Object.assign(toast.style, {
    position: "fixed",
    top: "16px",
    right: "16px",
    zIndex: "2147483647",
    padding: "10px 14px",
    background: "#0f6e7d",
    color: "#fff",
    borderRadius: "8px",
    font: "14px/1.4 'Malgun Gothic', sans-serif",
    boxShadow: "0 2px 8px rgba(0,0,0,0.25)"
  });
  doc.body.appendChild(toast);
  // 이 프레임이 도중에 이동해도 사라지도록, 안내창이 붙은 페이지의 타이머를 쓴다.
  host.setTimeout(() => toast.remove(), durationMs);
}
