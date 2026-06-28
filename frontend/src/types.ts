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
  events?: CalendarEvent[];
};

export type PipelineStep =
  | "idle"
  | "user_message"
  | "intent_detection"
  | "structured_output"
  | "validation"
  | "confirmation"
  | "crud_execution"
  | "calendar_updated";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export type PendingAction = {
  intent: IntentType;
  arguments: Record<string, unknown>;
};
