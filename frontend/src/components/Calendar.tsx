import { useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg, EventContentArg } from "@fullcalendar/core";
import { useEventStore } from "../store/eventStore";

function renderEventContent(arg: EventContentArg) {
  const start = arg.event.start;
  const end = arg.event.end;
  const durationMs =
    start && end ? end.getTime() - start.getTime() : 0;
  const isTimeGrid = arg.view.type.includes("timeGrid");
  const showTime = isTimeGrid && durationMs >= 75 * 60 * 1000;

  return (
    <div className="event-chip">
      <p className="event-chip-title">{arg.event.title}</p>
      {showTime && arg.timeText && (
        <p className="event-chip-time">{arg.timeText}</p>
      )}
    </div>
  );
}

export function Calendar() {
  const events = useEventStore((s) => s.events);
  const selectedEventId = useEventStore((s) => s.selectedEventId);
  const selectEvent = useEventStore((s) => s.selectEvent);
  const calendarRef = useRef<FullCalendar>(null);

  const fcEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start,
    end: e.end,
    classNames: e.id === selectedEventId ? ["fc-event-selected"] : [],
  }));

  function handleEventClick(info: EventClickArg) {
    selectEvent(info.event.id);
  }

  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    api.getEvents().forEach((ev) => {
      if (ev.id === selectedEventId) {
        ev.setProp("classNames", ["fc-event-selected"]);
      } else {
        ev.setProp("classNames", []);
      }
    });
  }, [selectedEventId]);

  return (
    <div className="calendar-shell h-full">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        views={{
          timeGridWeek: { displayEventTime: false },
          timeGridDay: { displayEventTime: false },
        }}
        events={fcEvents}
        eventClick={handleEventClick}
        eventContent={renderEventContent}
        height="100%"
        expandRows
        nowIndicator
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        scrollTime={new Date().toTimeString().slice(0, 8)}
        allDaySlot={false}
        slotEventOverlap={false}
        dayMaxEvents={3}
        eventTimeFormat={{
          hour: "numeric",
          minute: "2-digit",
          meridiem: "short",
        }}
      />
    </div>
  );
}
