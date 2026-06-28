import { z } from "zod";
import { getEventById, findEventsByTitle } from "../services/eventService.js";
import type { IntentResponse } from "../types.js";

const isoDateTime = z
  .string()
  .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid datetime" });

const createEventArgs = z.object({
  title: z.string().min(1),
  start: isoDateTime,
  end: isoDateTime,
  description: z.string().optional(),
  location: z.string().optional(),
});

const updateEventArgs = z.object({
  eventId: z.string().optional(),
  title: z.string().optional(),
  newTitle: z.string().optional(),
  start: isoDateTime.optional(),
  end: isoDateTime.optional(),
  description: z.string().optional(),
  location: z.string().optional(),
});

const deleteEventArgs = z.object({
  eventId: z.string().optional(),
  title: z.string().optional(),
});

const listEventsArgs = z.object({
  start: isoDateTime.optional(),
  end: isoDateTime.optional(),
});

const intentSchema = z.object({
  intent: z.enum([
    "create_event",
    "update_event",
    "delete_event",
    "list_events",
    "unknown",
  ]),
  arguments: z.record(z.unknown()).default({}),
  message: z.string().optional(),
});

export function validateIntent(raw: unknown): IntentResponse {
  const parsed = intentSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      intent: "unknown",
      arguments: {},
      message: "I couldn't understand that request.",
    };
  }

  const { intent, arguments: args, message } = parsed.data;

  if (intent === "unknown") {
    return {
      intent: "unknown",
      arguments: {},
      message: message ?? "I couldn't understand that request.",
    };
  }

  if (intent === "create_event") {
    const result = createEventArgs.safeParse(args);
    if (!result.success) {
      return {
        intent: "unknown",
        arguments: {},
        message: "I couldn't understand that request.",
      };
    }
    if (new Date(result.data.end) <= new Date(result.data.start)) {
      return {
        intent: "unknown",
        arguments: {},
        message: "End time must be after start time.",
      };
    }
    return { intent, arguments: result.data };
  }

  if (intent === "update_event") {
    const result = updateEventArgs.safeParse(args);
    if (!result.success) {
      return {
        intent: "unknown",
        arguments: {},
        message: "I couldn't understand that request.",
      };
    }
    const resolved = resolveEventReference(result.data);
    if (!resolved) {
      return {
        intent: "unknown",
        arguments: {},
        message: "I couldn't find the event to update.",
      };
    }
    return { intent, arguments: { ...result.data, eventId: resolved.id } };
  }

  if (intent === "delete_event") {
    const result = deleteEventArgs.safeParse(args);
    if (!result.success) {
      return {
        intent: "unknown",
        arguments: {},
        message: "I couldn't understand that request.",
      };
    }
    const resolved = resolveEventReference(result.data);
    if (!resolved) {
      return {
        intent: "unknown",
        arguments: {},
        message: "I couldn't find the event to delete.",
      };
    }
    return { intent, arguments: { eventId: resolved.id, title: resolved.title } };
  }

  if (intent === "list_events") {
    const result = listEventsArgs.safeParse(args);
    if (!result.success) {
      return {
        intent: "unknown",
        arguments: {},
        message: "I couldn't understand that request.",
      };
    }
    return { intent, arguments: result.data };
  }

  return {
    intent: "unknown",
    arguments: {},
    message: "I couldn't understand that request.",
  };
}

function resolveEventReference(args: {
  eventId?: string;
  title?: string;
}): { id: string; title: string } | null {
  if (args.eventId) {
    const event = getEventById(args.eventId);
    if (event) return { id: event.id, title: event.title };
  }
  if (args.title) {
    const matches = findEventsByTitle(args.title);
    if (matches.length === 1) return { id: matches[0].id, title: matches[0].title };
    if (matches.length > 1) {
      const sorted = [...matches].sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
      );
      return { id: sorted[0].id, title: sorted[0].title };
    }
  }
  return null;
}
