import { useEffect, useMemo, useState } from "react";
import {
  addCalendarEvent,
  deleteCalendarEvent,
  getCalendarEvents,
  updateCalendarEvent,
} from "../../../storage/calendar/calendarStorage";
import { addDays, addMonths, getMonthGrid, getWeekDates, toDateKey } from "../model/dateUtils";
import type { CalendarEvent, CalendarEventInput, CalendarViewMode } from "../model/types";

// 시간이 있는 일정은 시간 순으로, 시간이 없는 일정은 뒤로 보내되
// 나머지는 원래 순서(안정 정렬)를 그대로 유지한다.
function sortEventsOfDay(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => {
    if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
    if (a.startTime) return -1;
    if (b.startTime) return 1;
    return 0;
  });
}

export function useCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [viewMode, setViewMode] = useState<CalendarViewMode>("week");
  const [referenceDate, setReferenceDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  useEffect(() => {
    let cancelled = false;
    getCalendarEvents()
      .then((loaded) => {
        if (!cancelled) setEvents(loaded);
      })
      .catch((error) => {
        // 읽기 실패를 "일정 0개"로 덮어쓰지 않는다: events는 초기값([])을 유지하고 콘솔에만 남긴다.
        console.error("[wavoo/calendar] 일정을 불러오지 못했습니다.", error);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const weekDates = useMemo(() => getWeekDates(referenceDate), [referenceDate]);
  const monthGrid = useMemo(
    () => getMonthGrid(referenceDate.getFullYear(), referenceDate.getMonth()),
    [referenceDate]
  );

  const datesWithEvents = useMemo(() => new Set(events.map((event) => event.date)), [events]);

  const selectedDateKey = toDateKey(selectedDate);
  const selectedDateEvents = useMemo(
    () => sortEventsOfDay(events.filter((event) => event.date === selectedDateKey)),
    [events, selectedDateKey]
  );

  function goPrevWeek() {
    setReferenceDate((prev) => addDays(prev, -7));
  }

  function goNextWeek() {
    setReferenceDate((prev) => addDays(prev, 7));
  }

  function goPrevMonth() {
    setReferenceDate((prev) => {
      const { year, month } = addMonths(prev.getFullYear(), prev.getMonth(), -1);
      return new Date(year, month, 1);
    });
  }

  function goNextMonth() {
    setReferenceDate((prev) => {
      const { year, month } = addMonths(prev.getFullYear(), prev.getMonth(), 1);
      return new Date(year, month, 1);
    });
  }

  // 날짜를 고르면 주간/월간 어느 화면으로 전환하든 같은 날짜를 기준으로 보여준다.
  function selectDate(date: Date) {
    setSelectedDate(date);
    setReferenceDate(date);
  }

  function toggleViewMode() {
    setViewMode((prev) => (prev === "week" ? "month" : "week"));
  }

  async function addEvent(draft: CalendarEventInput) {
    const event: CalendarEvent = { ...draft, id: crypto.randomUUID() };
    try {
      const next = await addCalendarEvent(event);
      setEvents(next);
    } catch (error) {
      // storage read/write 실패 시 화면 상태를 잘못 덮어쓰지 않고 그대로 둔다.
      console.error("[wavoo/calendar] 일정을 추가하지 못했습니다.", error);
    }
  }

  async function editEvent(event: CalendarEvent) {
    try {
      const next = await updateCalendarEvent(event);
      setEvents(next);
    } catch (error) {
      console.error("[wavoo/calendar] 일정을 수정하지 못했습니다.", error);
    }
  }

  async function removeEvent(id: string) {
    try {
      const next = await deleteCalendarEvent(id);
      setEvents(next);
    } catch (error) {
      console.error("[wavoo/calendar] 일정을 삭제하지 못했습니다.", error);
    }
  }

  return {
    viewMode,
    toggleViewMode,
    referenceDate,
    weekDates,
    monthGrid,
    selectedDate,
    selectDate,
    selectedDateEvents,
    datesWithEvents,
    goPrevWeek,
    goNextWeek,
    goPrevMonth,
    goNextMonth,
    addEvent,
    editEvent,
    removeEvent,
  };
}
