// 확장앱의 유일한 background 진입점.
// 기능별 로직은 features/*/model 에 두고, 여기서는 alarm/이벤트만 연결한다.
import { checkNotices } from "../../features/notice/model/checkNotices";
import { setKeywords } from "../../storage/keywords";
import { clearNotices } from "../../storage/notices";

const NOTICE_ALARM = "notice-poll";
const NOTICE_POLL_MINUTES = 30;

function runNoticeCheck() {
  checkNotices().catch((error) => console.warn("[notice] 확인 실패", error));
}

async function ensureNoticeAlarm() {
  if (!(await chrome.alarms.get(NOTICE_ALARM))) {
    chrome.alarms.create(NOTICE_ALARM, { periodInMinutes: NOTICE_POLL_MINUTES });
  }
}

// 설치/업데이트 직후와 웨일을 켤 때마다 바로 한 번 확인한다 (다음 알람까지 기다리지 않도록).
chrome.runtime.onInstalled.addListener(() => {
  void ensureNoticeAlarm();
  runNoticeCheck();
});

chrome.runtime.onStartup.addListener(() => {
  void ensureNoticeAlarm();
  runNoticeCheck();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === NOTICE_ALARM) runNoticeCheck();
});

// 개발·시연용: 서비스 워커 콘솔에서 wavoo.checkNow() 처럼 직접 실행한다.
Object.assign(globalThis, {
  wavoo: { checkNow: checkNotices, resetNotices: clearNotices, setKeywords }
});
