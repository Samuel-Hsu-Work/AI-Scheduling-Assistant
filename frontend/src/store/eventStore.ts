import { create } from "zustand";
import type {
  CalendarEvent,
  ChatMessage,
  PendingAction,
  PipelineStep,
} from "../types";
import { api } from "../services/api";

type EventStore = {
  events: CalendarEvent[];
  selectedEventId: string | null;
  messages: ChatMessage[];
  pendingAction: PendingAction | null;
  pipelineStep: PipelineStep;
  isLoading: boolean;

  fetchEvents: () => Promise<void>;
  selectEvent: (id: string | null) => void;
  addMessage: (role: "user" | "assistant", content: string) => void;
  setPipelineStep: (step: PipelineStep) => void;
  setPendingAction: (action: PendingAction | null) => void;
  setLoading: (loading: boolean) => void;
  executePendingAction: () => Promise<boolean>;
  cancelPendingAction: () => void;
};

let msgCounter = 0;
function makeId() {
  return `msg-${++msgCounter}-${Date.now()}`;
}

export const useEventStore = create<EventStore>((set, get) => ({
  events: [],
  selectedEventId: null,
  messages: [],
  pendingAction: null,
  pipelineStep: "idle",
  isLoading: false,

  fetchEvents: async () => {
    const events = await api.getEvents();
    set({ events });
  },

  selectEvent: (id) => set({ selectedEventId: id }),

  addMessage: (role, content) =>
    set((s) => ({
      messages: [
        ...s.messages,
        { id: makeId(), role, content, timestamp: new Date() },
      ],
    })),

  setPipelineStep: (step) => set({ pipelineStep: step }),

  setPendingAction: (action) => set({ pendingAction: action }),

  setLoading: (loading) => set({ isLoading: loading }),

  executePendingAction: async () => {
    const { pendingAction } = get();
    if (!pendingAction) return false;

    set({ pipelineStep: "crud_execution" });
    const { intent, arguments: args } = pendingAction;

    try {
      if (intent === "create_event") {
        await api.createEvent({
          title: args.title as string,
          start: args.start as string,
          end: args.end as string,
          description: args.description as string | undefined,
          location: args.location as string | undefined,
        });
      } else if (intent === "update_event") {
        const eventId = args.eventId as string;
        const updates: Partial<CalendarEvent> = {};
        if (args.newTitle) updates.title = args.newTitle as string;
        if (args.start) updates.start = args.start as string;
        if (args.end) updates.end = args.end as string;
        if (args.description) updates.description = args.description as string;
        if (args.location) updates.location = args.location as string;
        await api.updateEvent(eventId, updates);
      } else if (intent === "delete_event") {
        await api.deleteEvent(args.eventId as string);
      }

      await get().fetchEvents();
      set({ pipelineStep: "calendar_updated", pendingAction: null });

      setTimeout(() => {
        if (get().pipelineStep === "calendar_updated") {
          set({ pipelineStep: "idle" });
        }
      }, 2000);
      return true;
    } catch {
      get().addMessage("assistant", "Something went wrong executing that action.");
      set({ pipelineStep: "idle", pendingAction: null });
      return false;
    }
  },

  cancelPendingAction: () => {
    set({ pendingAction: null, pipelineStep: "idle" });
    get().addMessage("assistant", "Action cancelled.");
  },
}));
