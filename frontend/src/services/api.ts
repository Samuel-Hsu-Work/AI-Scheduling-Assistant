import type { CalendarEvent, IntentResponse } from "../types";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  getEvents: () => request<CalendarEvent[]>("/events"),

  createEvent: (data: Omit<CalendarEvent, "id">) =>
    request<CalendarEvent>("/events", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateEvent: (id: string, data: Partial<CalendarEvent>) =>
    request<CalendarEvent>(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteEvent: (id: string) =>
    request<void>(`/events/${id}`, { method: "DELETE" }),

  sendMessage: (
    message: string,
    history?: { role: "user" | "assistant"; content: string }[]
  ) =>
    request<IntentResponse>("/chat", {
      method: "POST",
      body: JSON.stringify({ message, history }),
    }),
};
