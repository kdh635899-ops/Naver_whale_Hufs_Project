import { PERIOD_TIMES, type PeriodTime } from "../../../constants/timetable";
import type { TimetableEntry } from "../../../types/timetable";
import { classesOnDay, MINUTE_MS, startOfDay } from "./timetable";

// "다음 수업 N분 전" 알림 대상을 고르는 순수 함수.

export interface DueReminder {
  entry: TimetableEntry;
  startAt: number;
  minutesUntil: number;
  /** 같은 날 같은 수업을 두 번 알리지 않기 위한 키 (날짜:수업ID) */
  key: string;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function localDateKey(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function findDueReminders(
  entries: TimetableEntry[],
  now: number,
  remindBeforeMinutes: number,
  sentKeys: string[],
  table: Record<number, PeriodTime> = PERIOD_TIMES
): DueReminder[] {
  const sent = new Set(sentKeys);
  const dateKey = localDateKey(now);

  return classesOnDay(entries, startOfDay(now), table)
    .filter((c) => c.startAt > now && c.startAt - now <= remindBeforeMinutes * MINUTE_MS)
    .map((c) => ({
      entry: c.entry,
      startAt: c.startAt,
      minutesUntil: Math.ceil((c.startAt - now) / MINUTE_MS),
      key: `${dateKey}:${c.entry.id}`
    }))
    .filter((r) => !sent.has(r.key));
}

/** 오늘 것만 남긴다 (저장 목록이 계속 커지지 않게) */
export function keepTodayKeys(keys: string[], now: number): string[] {
  const prefix = `${localDateKey(now)}:`;
  return keys.filter((k) => k.startsWith(prefix));
}
