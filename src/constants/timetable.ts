export interface PeriodTime {
  /** 자정부터의 분 (예: 09:00 = 540) */
  start: number;
  end: number;
}

// 임시 가정: 1교시 09:00 시작, 교시마다 50분 수업 + 10분 쉬는 시간.
// 학교 공식 교시 시간을 확인해서 이 표를 교체해야 한다. (계산 로직은 이 표만 읽는다)
export const PERIOD_TIMES: Record<number, PeriodTime> = Object.fromEntries(
  Array.from({ length: 14 }, (_, i) => [i + 1, { start: 9 * 60 + i * 60, end: 9 * 60 + i * 60 + 50 }])
);

export const CLASS_ALARM = "class-reminder";
export const CLASS_ALARM_PERIOD_MINUTES = 1;
/** 수업 시작 몇 분 전부터 알림을 보낼지 */
export const CLASS_REMIND_BEFORE_MINUTES = 20;
