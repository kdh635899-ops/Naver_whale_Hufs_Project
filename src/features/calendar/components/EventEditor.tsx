import { useState, type FormEvent } from "react";
import type { CalendarEvent, CalendarEventInput } from "../model/types";

interface EventEditorProps {
  date: string;
  initialEvent?: CalendarEvent;
  onSave: (event: CalendarEvent | CalendarEventInput) => void;
  onCancel: () => void;
}

export function EventEditor({ date, initialEvent, onSave, onCancel }: EventEditorProps) {
  const [title, setTitle] = useState(initialEvent?.title ?? "");
  const [startTime, setStartTime] = useState(initialEvent?.startTime ?? "");
  const [endTime, setEndTime] = useState(initialEvent?.endTime ?? "");
  const [memo, setMemo] = useState(initialEvent?.memo ?? "");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    // 종료 시간이 시작 시간보다 빠른 경우(예: 15:00 ~ 14:00)는 저장하지 않는다.
    if (startTime && endTime && startTime > endTime) return;

    const base: CalendarEventInput = {
      title: title.trim(),
      date,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      memo: memo.trim() || undefined,
    };

    onSave(initialEvent ? { ...base, id: initialEvent.id } : base);
  }

  return (
    <form className="wavoo-calendar-editor" onSubmit={handleSubmit}>
      <input
        placeholder="일정 제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />
      <div className="wavoo-calendar-editor-row">
        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
      </div>
      <textarea placeholder="메모" value={memo} onChange={(e) => setMemo(e.target.value)} rows={2} />
      <div className="wavoo-calendar-editor-actions">
        <button type="button" onClick={onCancel}>
          취소
        </button>
        <button type="submit" data-variant="primary">
          저장
        </button>
      </div>
    </form>
  );
}
