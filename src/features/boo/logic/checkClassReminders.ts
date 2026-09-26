import { CLASS_REMIND_BEFORE_MINUTES } from "../../../constants/timetable";
import { getSentReminders, getTimetable, saveSentReminders } from "../../../storage/timetable";
import { findDueReminders, keepTodayKeys, type DueReminder } from "./reminders";
import { classLabel } from "./timetable";

function notify(reminder: DueReminder) {
  const start = new Date(reminder.startAt);
  const clock = `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`;
  void chrome.notifications.create({
    type: "basic",
    iconUrl: chrome.runtime.getURL("public/icons/icon128.png"),
    title: "BOO · 곧 수업이 시작돼요",
    message: `${classLabel(reminder.entry)} · ${reminder.minutesUntil}분 뒤 시작 (${clock})`
  });
}

// 저장된 시간표에서 곧 시작하는 수업이 있으면 알림을 보낸다. 알람이 1분마다 호출한다.
export async function checkClassReminders(
  now: number = Date.now(),
  remindBeforeMinutes: number = CLASS_REMIND_BEFORE_MINUTES
): Promise<DueReminder[]> {
  const saved = await getTimetable();
  if (!saved || saved.entries.length === 0) return [];

  const sent = await getSentReminders();
  const due = findDueReminders(saved.entries, now, remindBeforeMinutes, sent);
  if (due.length === 0) return [];

  // 알림보다 기록을 먼저 남겨서, 도중에 실패해도 같은 알림이 반복되지 않게 한다.
  await saveSentReminders([...keepTodayKeys(sent, now), ...due.map((r) => r.key)]);
  due.forEach(notify);
  return due;
}
