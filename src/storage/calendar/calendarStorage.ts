import type { CalendarEvent } from "../../features/calendar/model/types";

const STORAGE_KEY = "wavoo.calendar.events";

// storage read 실패는 "일정 0개"가 아니라 실패 그 자체이므로 여기서 삼키지 않고 throw한다.
// 그렇지 않으면 get -> 수정 -> set 흐름에서 실패를 빈 배열로 오인해 기존 데이터를 덮어쓰게 된다.
export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return (result[STORAGE_KEY] as CalendarEvent[] | undefined) ?? [];
}

async function saveCalendarEvents(events: CalendarEvent[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: events });
}

export async function addCalendarEvent(event: CalendarEvent): Promise<CalendarEvent[]> {
  const events = await getCalendarEvents();
  const next = [...events, event];
  await saveCalendarEvents(next);
  return next;
}

export async function updateCalendarEvent(updated: CalendarEvent): Promise<CalendarEvent[]> {
  const events = await getCalendarEvents();
  const next = events.map((event) => (event.id === updated.id ? updated : event));
  await saveCalendarEvents(next);
  return next;
}

export async function deleteCalendarEvent(id: string): Promise<CalendarEvent[]> {
  const events = await getCalendarEvents();
  const next = events.filter((event) => event.id !== id);
  await saveCalendarEvents(next);
  return next;
}
