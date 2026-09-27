import { WEEKDAY_LABELS, isSameDay, toDateKey, type MonthGridDay } from "../model/dateUtils";

interface MonthlyCalendarProps {
  year: number;
  month: number;
  grid: MonthGridDay[];
  selectedDate: Date;
  datesWithEvents: Set<string>;
  onSelectDate: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onCollapse: () => void;
}

export function MonthlyCalendar({
  year,
  month,
  grid,
  selectedDate,
  datesWithEvents,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onCollapse,
}: MonthlyCalendarProps) {
  const today = new Date();

  return (
    <div>
      <div className="wavoo-calendar-header">
        <button className="wavoo-calendar-nav-btn" onClick={onPrevMonth} aria-label="이전 달">
          ◀
        </button>
        <span className="wavoo-calendar-header-title">
          {year}년 {month + 1}월
        </span>
        <button className="wavoo-calendar-nav-btn" onClick={onNextMonth} aria-label="다음 달">
          ▶
        </button>
      </div>

      <div className="wavoo-calendar-month-grid">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="wavoo-calendar-weekday-label">
            {label}
          </span>
        ))}

        {grid.map(({ date, inCurrentMonth }) => {
          const hasEvent = datesWithEvents.has(toDateKey(date));
          const isToday = isSameDay(date, today);
          const isSelected = isSameDay(date, selectedDate);

          return (
            <button
              key={toDateKey(date)}
              type="button"
              className={[
                "wavoo-calendar-day-cell",
                inCurrentMonth ? "" : "wavoo-calendar-day-cell--outside",
                isToday ? "wavoo-calendar-day-cell--today" : "",
                isSelected ? "wavoo-calendar-day-cell--selected" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onSelectDate(date)}
            >
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

      <div className="wavoo-calendar-header">
        <button className="wavoo-calendar-toggle-btn" onClick={onCollapse}>
          주간 보기로 접기 ▴
        </button>
      </div>
    </div>
  );
}
