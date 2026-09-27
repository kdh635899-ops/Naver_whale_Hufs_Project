// 로컬 타임존 기준으로 YYYY-MM-DD 문자열을 만든다.
// toISOString()은 UTC로 변환되므로 자정 근처 날짜가 하루 밀릴 수 있어 사용하지 않는다.
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// new Date(y, m, d)는 d(또는 m)가 범위를 벗어나도 자동으로 다음/이전 달·연도로 넘겨 계산한다.
// 이 성질을 이용하면 월말/월초/연도 경계를 별도 분기 없이 처리할 수 있다.
export function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

function startOfWeek(date: Date): Date {
  return addDays(date, -date.getDay());
}

export function getWeekDates(referenceDate: Date): Date[] {
  const start = startOfWeek(referenceDate);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function addMonths(
  year: number,
  month: number,
  amount: number
): { year: number; month: number } {
  const d = new Date(year, month + amount, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

export interface MonthGridDay {
  date: Date;
  inCurrentMonth: boolean;
}

// 항상 6주(42칸)를 채워서 이전/다음 달의 날짜까지 포함한 달력 그리드를 만든다.
export function getMonthGrid(year: number, month: number): MonthGridDay[] {
  const firstOfMonth = new Date(year, month, 1);
  const gridStart = addDays(firstOfMonth, -firstOfMonth.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const date = addDays(gridStart, i);
    return { date, inCurrentMonth: date.getMonth() === month };
  });
}

export const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
