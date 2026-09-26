import { PERIOD_TIMES, type PeriodTime } from "../../../constants/timetable";
import type { TimetableEntry } from "../../../types/timetable";

// 시간표 계산을 하는 순수 함수들. 저장소·브라우저 API와 무관해서 단독으로 시험할 수 있다.
// 문장은 조사(은/는, 이/가)가 과목명에 따라 틀리지 않도록 과목명 뒤에 조사를 붙이지 않게 쓴다.

export const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"] as const;
export const MINUTE_MS = 60_000;

type PeriodTable = Record<number, PeriodTime>;

export interface ScheduledClass {
  entry: TimetableEntry;
  startAt: number;
  endAt: number;
}

export function formatClock(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function clockOf(ms: number): string {
  const d = new Date(ms);
  return formatClock(d.getHours() * 60 + d.getMinutes());
}

export function classLabel(entry: TimetableEntry): string {
  return entry.room ? `${entry.name} (${entry.room})` : entry.name;
}

/** ms가 속한 날의 (컴퓨터 시간대 기준) 자정. addDays로 앞뒤 날짜를 구한다. */
export function startOfDay(ms: number, addDays = 0): number {
  const d = new Date(ms);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + addDays).getTime();
}

/** 그날의 수업을 시작 시각 순으로 돌려준다. 교시 시간표에 없는 교시의 수업은 건너뛴다. */
export function classesOnDay(entries: TimetableEntry[], dayStart: number, table: PeriodTable = PERIOD_TIMES): ScheduledClass[] {
  const weekday = new Date(dayStart).getDay();
  const scheduled: ScheduledClass[] = [];
  for (const entry of entries) {
    if (entry.day !== weekday) continue;
    const first = table[entry.periodStart];
    const last = table[entry.periodEnd];
    if (!first || !last) continue;
    scheduled.push({ entry, startAt: dayStart + first.start * MINUTE_MS, endAt: dayStart + last.end * MINUTE_MS });
  }
  return scheduled.sort((a, b) => a.startAt - b.startAt);
}

export function findCurrentClass(entries: TimetableEntry[], now: number, table: PeriodTable = PERIOD_TIMES): ScheduledClass | null {
  return classesOnDay(entries, startOfDay(now), table).find((c) => c.startAt <= now && now < c.endAt) ?? null;
}

/** 지금 이후 가장 가까운 수업. dayOffset은 오늘이 0, 내일이 1 … (최대 일주일 뒤까지) */
export function findNextClass(
  entries: TimetableEntry[],
  now: number,
  table: PeriodTable = PERIOD_TIMES
): { scheduled: ScheduledClass; dayOffset: number } | null {
  for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
    const scheduled = classesOnDay(entries, startOfDay(now, dayOffset), table).find((c) => c.startAt > now);
    if (scheduled) return { scheduled, dayOffset };
  }
  return null;
}

/** 수업이 하나도 없는 날(공강날)에 BOO가 하는 말. 하루에 하나가 정해지고 날짜가 바뀌면 다른 말을 한다. */
export const FREE_DAY_MESSAGES = [
  "여유로운 공강날이에요! 푹 쉬어도 좋아요.",
  "오늘은 수업이 없는 날이에요. 하고 싶었던 걸 해봐요!",
  "공강날! 밀린 공부도, 낮잠도 좋아요.",
  "오늘은 자유예요. 맛있는 거 먹으러 갈까요?",
  "수업 없는 날이에요. 도서관에서 여유롭게 공부해도 좋겠어요.",
  "오늘은 쉬는 날! 컨디션 충전하는 하루 보내세요."
] as const;

export function pickFreeDayMessage(now: number): string {
  const d = new Date(now);
  return FREE_DAY_MESSAGES[(d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate()) % FREE_DAY_MESSAGES.length];
}

export interface TimetableMessages {
  messages: string[];
  /** 곧(30분 이내) 시작하는 수업이 있어 BOO가 먼저 알려야 할 때 */
  urgent: boolean;
}

export function describeTimetable(entries: TimetableEntry[], now: number, table: PeriodTable = PERIOD_TIMES): TimetableMessages {
  if (entries.length === 0) {
    return { messages: ["시간표를 아직 몰라요. 종합정보시스템에서 개인시간표를 열어주세요!"], urgent: false };
  }

  const today = classesOnDay(entries, startOfDay(now), table);
  const messages: string[] = [];
  let urgent = false;

  const current = findCurrentClass(entries, now, table);
  if (current) messages.push(`지금은 ${classLabel(current.entry)} 수업 중이에요.`);

  const next = findNextClass(entries, now, table);
  if (next) {
    const { scheduled, dayOffset } = next;
    const label = classLabel(scheduled.entry);
    const clock = clockOf(scheduled.startAt);
    const minutes = Math.ceil((scheduled.startAt - now) / MINUTE_MS);
    const dayName = DAY_NAMES[new Date(scheduled.startAt).getDay()];

    if (dayOffset === 0 && minutes <= 30) {
      urgent = true;
      messages.unshift(`다음 수업(${label})이 ${minutes}분 뒤에 시작해요!`);
    } else if (dayOffset === 0) {
      messages.push(`오늘 다음 수업은 ${clock}에 시작해요: ${label}`);
    } else {
      const when = dayOffset === 1 ? "내일 첫 수업은" : `다음 수업은 ${dayName}요일`;
      const upcoming = `${when} ${clock}에 시작해요: ${label}`;
      if (today.length > 0) messages.push(`오늘 수업은 끝났어요! ${upcoming}`);
      else messages.push(pickFreeDayMessage(now), upcoming);
    }
  } else {
    messages.push("저장된 시간표에서 다음 수업을 찾지 못했어요.");
  }

  if (today.length > 0) {
    const day = DAY_NAMES[new Date(now).getDay()];
    messages.push(`${day}요일 시간표: ${today.map((c) => `${c.entry.name} ${clockOf(c.startAt)}~${clockOf(c.endAt)}`).join(", ")}`);
  }
  return { messages, urgent };
}
