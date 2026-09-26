import type { TimetableEntry } from "../../types/timetable";

// 종합정보시스템 개인시간표 화면의 표를 읽는다.
// 클래스 이름 같은 화면 구조에 기대지 않고, "월·화·수·목·금 머리글이 있는 표"를 내용으로 찾는다.
// 표에는 과목명과 강의실만 있고, 학번·이름 같은 개인정보 영역은 읽지 않는다.

const DAY_BY_LABEL: Record<string, number> = { 일: 0, 월: 1, 화: 2, 수: 3, 목: 4, 금: 5, 토: 6 };
const REQUIRED_DAYS = ["월", "화", "수", "목", "금"];
const BLOCK_TAGS = /^(DIV|P|LI|UL|OL|TABLE|TR|TD|TH|SPAN_BLOCK)$/;

export type TimetableParseResult =
  | { status: "no-table"; tableCount: number }
  | { status: "empty" }
  | { status: "ok"; entries: TimetableEntry[]; semester?: string };

/** 칸 안의 글을 줄 단위로 나눈다. <br>과 블록 태그를 줄바꿈으로 본다. */
function cellLines(cell: Element): string[] {
  const lines: string[] = [];
  let current = "";
  const flush = () => {
    const text = current.replace(/\s+/g, " ").trim();
    if (text) lines.push(text);
    current = "";
  };
  const walk = (node: Node) => {
    if (node.nodeType === 3) {
      current += node.textContent ?? "";
      return;
    }
    if (node.nodeType !== 1) return;
    const element = node as Element;
    if (element.tagName === "BR") {
      flush();
      return;
    }
    const isBlock = BLOCK_TAGS.test(element.tagName);
    if (isBlock) flush();
    element.childNodes.forEach(walk);
    if (isBlock) flush();
  };
  cell.childNodes.forEach(walk);
  flush();
  return lines;
}

const isParenthesized = (line: string) => /^\(.*\)$/.test(line);

/** 칸의 줄들에서 과목명과 강의실을 뽑는다. 예: ["AI시대의진로취업", "(HUFS Career Design)", "(인문과학관1301)"] */
function parseCourse(lines: string[]): { name: string; room: string } | null {
  if (lines.length === 0 || isParenthesized(lines[0])) return null;

  // 한 줄에 "과목 (강의실)"로 붙어 있는 경우. 공백이 있어야 하므로 "경제학원론(2)" 같은 과목명은 건드리지 않는다.
  if (lines.length === 1) {
    const joined = lines[0].match(/^(.+?)\s+\(([^()]+)\)$/);
    return joined ? { name: joined[1].trim(), room: joined[2].trim() } : { name: lines[0], room: "" };
  }

  const last = lines[lines.length - 1];
  let room = "";
  if (isParenthesized(last)) {
    const inner = last.slice(1, -1).trim();
    const parenthesizedCount = lines.filter(isParenthesized).length;
    // 괄호가 하나뿐이고 한글·숫자가 없으면 영어 과목명이지 강의실이 아니다.
    const isEnglishName = parenthesizedCount === 1 && !/[가-힣0-9]/.test(inner);
    if (!isEnglishName) room = inner;
  }
  return { name: lines[0], room };
}

function findTimetable(doc: Document): { rows: HTMLTableRowElement[]; headerIndex: number; dayColumns: Map<number, number> } | null {
  for (const table of Array.from(doc.querySelectorAll("table"))) {
    const rows = Array.from(table.rows);
    for (let r = 0; r < Math.min(rows.length, 3); r++) {
      const labels = Array.from(rows[r].cells).map((cell) => (cell.textContent ?? "").replace(/\s+/g, ""));
      if (!REQUIRED_DAYS.every((day) => labels.includes(day))) continue;
      const dayColumns = new Map<number, number>();
      labels.forEach((label, index) => {
        if (label in DAY_BY_LABEL) dayColumns.set(index, DAY_BY_LABEL[label]);
      });
      return { rows, headerIndex: r, dayColumns };
    }
  }
  return null;
}

function readSemester(doc: Document): string | undefined {
  const match = (doc.body?.textContent ?? "").match(/(\d{4})\s*년도?\s*(\d)\s*학기/);
  return match ? `${match[1]}-${match[2]}` : undefined;
}

export function parseTimetable(doc: Document): TimetableParseResult {
  const found = findTimetable(doc);
  if (!found) return { status: "no-table", tableCount: doc.querySelectorAll("table").length };

  // 요일별로 "교시 -> 과목" 표를 만든다. 학교 화면은 같은 과목이 차지한 교시마다 칸이 반복된다.
  const grid = new Map<number, Map<number, { name: string; room: string }>>();
  for (const row of found.rows.slice(found.headerIndex + 1)) {
    const cells = Array.from(row.cells);
    const periodText = (cells[0]?.textContent ?? "").trim();
    if (!/^\d{1,2}$/.test(periodText)) continue;
    const period = Number(periodText);

    for (const [column, day] of found.dayColumns) {
      const course = cells[column] ? parseCourse(cellLines(cells[column])) : null;
      if (!course) continue;
      if (!grid.has(day)) grid.set(day, new Map());
      grid.get(day)!.set(period, course);
    }
  }

  // 같은 과목이 이어진 교시는 한 수업으로 합친다 (예: 1·2·3교시 -> 1~3교시).
  const entries: TimetableEntry[] = [];
  for (const [day, periods] of grid) {
    let open: TimetableEntry | null = null;
    for (const period of [...periods.keys()].sort((a, b) => a - b)) {
      const course = periods.get(period)!;
      if (open && open.periodEnd === period - 1 && open.name === course.name && open.room === course.room) {
        open.periodEnd = period;
        continue;
      }
      open = { id: `${day}:${period}:${course.name}`, day, periodStart: period, periodEnd: period, name: course.name, room: course.room };
      entries.push(open);
    }
  }
  entries.sort((a, b) => a.day - b.day || a.periodStart - b.periodStart);

  if (entries.length === 0) return { status: "empty" };
  return { status: "ok", entries, semester: readSemester(doc) };
}
