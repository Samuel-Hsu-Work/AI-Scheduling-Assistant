export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
};

export type IntentType =
  | "create_event"
  | "update_event"
  | "delete_event"
  | "list_events"
  | "unknown";

export type IntentResponse = {
  intent: IntentType;
  arguments: Record<string, unknown>;
  message?: string;
};
