export interface PeriodTime {
  /** 자정부터의 분 (예: 09:00 = 540) */
  start: number;
  end: number;
}

// 학교 기준: 1교시 09:00 시작, 교시마다 1시간, 14교시(22:00~23:00)까지.
// 연속 교시 수업은 처음 교시의 시작 ~ 마지막 교시의 끝으로 본다 (예: 1~3교시 = 09:00~12:00).
export const PERIOD_TIMES: Record<number, PeriodTime> = Object.fromEntries(
  Array.from({ length: 14 }, (_, i) => [i + 1, { start: 9 * 60 + i * 60, end: 9 * 60 + (i + 1) * 60 }])
);

export const CLASS_ALARM = "class-reminder";
export const CLASS_ALARM_PERIOD_MINUTES = 1;
/** 수업 시작 몇 분 전에 알림을 보낼지 */
export const CLASS_REMIND_BEFORE_MINUTES = 15;
