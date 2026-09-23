// 확장앱의 유일한 background 진입점.
// 공지 알림(notice)과 BOO 리마인더처럼 여러 기능이 각자의 alarm/리스너를
// 이 한 파일에서 등록하는 방식으로 합친다 (기능별 background 로직은
// features/*/model 또는 features/*/logic 에 두고 여기서 import해서 연결).

chrome.runtime.onInstalled.addListener(() => {
  // 예: chrome.alarms.create("notice-poll", { periodInMinutes: 30 });
});
