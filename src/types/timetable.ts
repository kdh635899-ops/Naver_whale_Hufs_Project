export interface TimetableEntry {
  /** 같은 과목·요일의 연속 교시를 묶은 한 항목의 고유 키 */
  id: string;
  /** 요일: 0=일요일 … 6=토요일 (Date#getDay 기준) */
  day: number;
  /** 수업이 차지하는 첫 교시와 마지막 교시 (예: 5~6교시) */
  periodStart: number;
  periodEnd: number;
  name: string;
  /** 강의실 (예: 사회과학관3408). 없으면 빈 문자열 */
  room: string;
}

/** 로컬에 저장되는 개인 시간표 */
export interface SavedTimetable {
  savedAt: number;
  entries: TimetableEntry[];
  /** 학교 화면에 적힌 학기 (예: 2026-2) */
  semester?: string;
}

/** 개인시간표 페이지에서 시간표를 읽으려던 마지막 시도의 결과 */
export interface CaptureStatus {
  at: number;
  kind: "saved" | "unchanged" | "empty" | "no-table";
  message: string;
}
