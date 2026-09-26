import { PERIOD_TIMES, type PeriodTime } from "../../../constants/timetable";
import type { TimetableEntry } from "../../../types/timetable";
import { startOfDay } from "./timetable";

// 개발·시연용 가짜 시간표. 지금 시각 기준으로 곧 시작하는 수업이 생기도록 만든다.
export function makeDemoTimetable(now: number, table: Record<number, PeriodTime> = PERIOD_TIMES): TimetableEntry[] {
  const dayStart = startOfDay(now);
  const minutesNow = (now - dayStart) / 60_000;
  const periods = Object.keys(table).map(Number).sort((a, b) => a - b);
  const lastPeriod = periods[periods.length - 1];
  const upcoming = periods.filter((p) => table[p].start >= minutesNow + 10);

  const today = new Date(dayStart).getDay();
  const tomorrow = new Date(startOfDay(now, 1)).getDay();
  const entries: TimetableEntry[] = [];

  if (upcoming.length >= 1) {
    entries.push({ id: "demo-a", day: today, periodStart: upcoming[0], periodEnd: Math.min(upcoming[0] + 1, lastPeriod), name: "샘플 수업 A", room: "샘플관 101" });
  }
  if (upcoming.length >= 4) {
    entries.push({ id: "demo-b", day: today, periodStart: upcoming[3], periodEnd: Math.min(upcoming[3] + 1, lastPeriod), name: "샘플 수업 B", room: "샘플관 305" });
  }
  entries.push({ id: "demo-c", day: tomorrow, periodStart: 1, periodEnd: 3, name: "샘플 수업 C", room: "샘플관 202" });
  return entries;
}
