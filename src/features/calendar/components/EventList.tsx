import type { CalendarEvent } from "../model/types";

interface EventListProps {
  dateLabel: string;
  events: CalendarEvent[];
  onAdd: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (id: string) => void;
}

export function EventList({ dateLabel, events, onAdd, onEdit, onDelete }: EventListProps) {
  return (
    <div className="wavoo-calendar-events">
      <div className="wavoo-calendar-events-header">
        <span className="wavoo-calendar-events-date">{dateLabel}</span>
        <button className="wavoo-calendar-add-btn" onClick={onAdd}>
          + 일정 추가
        </button>
      </div>

      {events.length === 0 && <p className="wavoo-calendar-empty">등록된 일정이 없습니다.</p>}

      {events.map((event) => (
        <div key={event.id} className="wavoo-calendar-event-item">
          {(event.startTime || event.endTime) && (
            <span className="wavoo-calendar-event-time">
              {event.startTime ?? ""}
              {event.startTime && event.endTime ? " ~ " : ""}
              {event.endTime ?? ""}
            </span>
          )}
          <span className="wavoo-calendar-event-title">{event.title}</span>
          <span className="wavoo-calendar-event-actions">
            <button onClick={() => onEdit(event)}>수정</button>
            <button onClick={() => onDelete(event.id)}>삭제</button>
          </span>
        </div>
      ))}
    </div>
  );
}
