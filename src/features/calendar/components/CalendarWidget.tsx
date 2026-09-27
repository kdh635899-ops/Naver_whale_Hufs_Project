import { useState } from "react";
import "./calendar.css";
import { useCalendar } from "../hooks/useCalendar";
import { toDateKey } from "../model/dateUtils";
import type { CalendarEvent, CalendarEventInput } from "../model/types";
import { WeeklyCalendar } from "./WeeklyCalendar";
import { MonthlyCalendar } from "./MonthlyCalendar";
import { EventList } from "./EventList";
import { EventEditor } from "./EventEditor";

// WAVOO 홈 상단에 <CalendarWidget /> 한 줄로 삽입하는 외부 진입점.
export function CalendarWidget() {
  const {
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
  } = useCalendar();

  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const selectedDateKey = toDateKey(selectedDate);
  const dateLabel = `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`;
  const isEditorOpen = isAdding || editingEvent !== null;

  function handleSelectDate(date: Date) {
    selectDate(date);
    setIsAdding(false);
    setEditingEvent(null);
  }

  function handleSave(event: CalendarEvent | CalendarEventInput) {
    if ("id" in event) {
      editEvent(event);
    } else {
      addEvent(event);
    }
    setIsAdding(false);
    setEditingEvent(null);
  }

  function handleCancelEdit() {
    setIsAdding(false);
    setEditingEvent(null);
  }

  // 지금 편집 중인 일정이 삭제되면 편집기가 죽은 데이터를 들고 열려있지 않도록 함께 닫는다.
  function handleDelete(id: string) {
    if (editingEvent?.id === id) {
      setEditingEvent(null);
    }
    removeEvent(id);
  }

  return (
    <div className="wavoo-calendar-widget">
      {viewMode === "week" ? (
        <WeeklyCalendar
          weekDates={weekDates}
          selectedDate={selectedDate}
          datesWithEvents={datesWithEvents}
          onSelectDate={handleSelectDate}
          onPrevWeek={goPrevWeek}
          onNextWeek={goNextWeek}
          onExpand={toggleViewMode}
        />
      ) : (
        <MonthlyCalendar
          year={referenceDate.getFullYear()}
          month={referenceDate.getMonth()}
          grid={monthGrid}
          selectedDate={selectedDate}
          datesWithEvents={datesWithEvents}
          onSelectDate={handleSelectDate}
          onPrevMonth={goPrevMonth}
          onNextMonth={goNextMonth}
          onCollapse={toggleViewMode}
        />
      )}

      <EventList
        dateLabel={dateLabel}
        events={selectedDateEvents}
        onAdd={() => {
          setEditingEvent(null);
          setIsAdding(true);
        }}
        onEdit={(event) => {
          setIsAdding(false);
          setEditingEvent(event);
        }}
        onDelete={handleDelete}
      />

      {isEditorOpen && (
        <EventEditor
          date={selectedDateKey}
          initialEvent={editingEvent ?? undefined}
          onSave={handleSave}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
}
