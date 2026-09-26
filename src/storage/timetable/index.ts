import type { CaptureStatus, SavedTimetable, TimetableEntry } from "../../types/timetable";

export const TIMETABLE_KEY = "timetable";
export const CAPTURE_STATUS_KEY = "timetableCaptureStatus";
const SENT_REMINDERS_KEY = "classReminderSent";

export async function getTimetable(): Promise<SavedTimetable | null> {
  const stored = await chrome.storage.local.get(TIMETABLE_KEY);
  const value = stored[TIMETABLE_KEY] as SavedTimetable | undefined;
  return value && Array.isArray(value.entries) ? value : null;
}

export function saveTimetable(entries: TimetableEntry[], now: number = Date.now(), semester?: string): Promise<void> {
  const value: SavedTimetable = { savedAt: now, entries, ...(semester && { semester }) };
  return chrome.storage.local.set({ [TIMETABLE_KEY]: value });
}

export function clearTimetable(): Promise<void> {
  return chrome.storage.local.remove([TIMETABLE_KEY, CAPTURE_STATUS_KEY]);
}

export function saveCaptureStatus(status: CaptureStatus): Promise<void> {
  return chrome.storage.local.set({ [CAPTURE_STATUS_KEY]: status });
}

/** 이미 알림을 보낸 수업 키 목록 (하루에 같은 수업을 두 번 알리지 않기 위해) */
export async function getSentReminders(): Promise<string[]> {
  const stored = await chrome.storage.local.get(SENT_REMINDERS_KEY);
  const list = stored[SENT_REMINDERS_KEY];
  return Array.isArray(list) ? list.filter((k): k is string => typeof k === "string") : [];
}

export function saveSentReminders(keys: string[]): Promise<void> {
  return chrome.storage.local.set({ [SENT_REMINDERS_KEY]: keys });
}

export function clearSentReminders(): Promise<void> {
  return chrome.storage.local.remove(SENT_REMINDERS_KEY);
}
