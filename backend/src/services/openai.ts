import OpenAI from "openai";
import { getAllEvents } from "./eventService.js";
import { validateIntent } from "../validators/intent.js";
import type { IntentResponse } from "../types.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are an AI calendar assistant. Your job is to interpret natural language requests and return structured JSON intent objects.

CRITICAL RULES:
- NEVER execute actions yourself. Only return intent JSON.
- Always use ISO 8601 datetime strings (e.g. "2026-06-28T19:00:00") without timezone offset.
- Infer reasonable end times (default 1 hour after start if not specified).
- For relative dates like "tomorrow", "Friday", "next week", resolve them based on the current date provided.
- For update/delete, match events by title from the existing events list.
- For list_events, set start/end range based on the query (e.g. "this week" = Monday to Sunday of current week).

Return ONLY valid JSON with this shape:
{
  "intent": "create_event" | "update_event" | "delete_event" | "list_events" | "unknown",
  "arguments": { ... },
  "message": "optional human-readable summary for list_events or unknown"
}

Intent argument schemas:
- create_event: { title, start, end, description?, location? }
- update_event: { eventId?, title (to find event), newTitle?, start?, end?, description?, location? }
- delete_event: { eventId?, title (to find event) }
- list_events: { start?, end? }
- unknown: {} with a helpful message`;

export async function parseUserMessage(
  message: string,
  history: { role: "user" | "assistant"; content: string }[] = []
): Promise<IntentResponse> {
  const now = new Date();
  const events = getAllEvents();

  const contextMessage = `Current date/time: ${now.toISOString()}
Day of week: ${now.toLocaleDateString("en-US", { weekday: "long" })}

Existing events:
${events.length === 0 ? "(none)" : events.map((e) => `- id: ${e.id}, title: "${e.title}", start: ${e.start}, end: ${e.end}`).join("\n")}`;

  const historyMessages = history.slice(-6).map((h) => ({
    role: h.role as "user" | "assistant",
    content: h.content,
  }));

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: contextMessage },
        ...historyMessages,
        { role: "user", content: message },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return {
        intent: "unknown",
        arguments: {},
        message: "I couldn't understand that request.",
      };
    }

    const raw = JSON.parse(content);
    return validateIntent(raw);
  } catch {
    return {
      intent: "unknown",
      arguments: {},
      message: "I couldn't understand that request.",
    };
  }
}

export function summarizeEvents(
  events: { title: string; start: string; end: string }[]
): string {
  if (events.length === 0) return "You have no events in that time range.";

  const lines = events.map((e) => {
    const start = new Date(e.start);
    const day = start.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const time = start.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    return `• ${e.title} — ${day} at ${time}`;
  });

  return `Here's what you have:\n${lines.join("\n")}`;
}
