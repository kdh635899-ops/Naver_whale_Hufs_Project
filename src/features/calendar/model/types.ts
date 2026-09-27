export type CalendarViewMode = "week" | "month";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  memo?: string;
}

// 새 일정을 만들 때는 아직 id가 없다.
export type CalendarEventInput = Omit<CalendarEvent, "id">;
