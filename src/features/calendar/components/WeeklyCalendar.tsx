import { WEEKDAY_LABELS, isSameDay, toDateKey } from "../model/dateUtils";

interface WeeklyCalendarProps {
  weekDates: Date[];
  selectedDate: Date;
  datesWithEvents: Set<string>;
  onSelectDate: (date: Date) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onExpand: () => void;
}

export function WeeklyCalendar({
  weekDates,
  selectedDate,
  datesWithEvents,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
  onExpand,
}: WeeklyCalendarProps) {
  const today = new Date();

  return (
    <div>
      <div className="wavoo-calendar-header">
        <button className="wavoo-calendar-nav-btn" onClick={onPrevWeek} aria-label="이전 주">
          ◀
        </button>
        <button className="wavoo-calendar-toggle-btn" onClick={onExpand}>
          월간 보기 ▾
        </button>
        <button className="wavoo-calendar-nav-btn" onClick={onNextWeek} aria-label="다음 주">
          ▶
        </button>
      </div>

      <div className="wavoo-calendar-week-grid">
        {weekDates.map((date, i) => {
          const hasEvent = datesWithEvents.has(toDateKey(date));
          const isToday = isSameDay(date, today);
          const isSelected = isSameDay(date, selectedDate);

          return (
            <button
              key={toDateKey(date)}
              type="button"
              className={[
                "wavoo-calendar-day-cell",
                isToday ? "wavoo-calendar-day-cell--today" : "",
                isSelected ? "wavoo-calendar-day-cell--selected" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onSelectDate(date)}
            >
              <span className="wavoo-calendar-weekday-label">{WEEKDAY_LABELS[i]}</span>
              <span>{date.getDate()}</span>
              <span
                className={[
                  "wavoo-calendar-day-dot",
                  hasEvent ? "" : "wavoo-calendar-day-dot--placeholder",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
