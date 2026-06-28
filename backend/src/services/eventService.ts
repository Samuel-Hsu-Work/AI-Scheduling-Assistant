import { randomUUID } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import type { CalendarEvent } from "../types.js";

const DATA_DIR = process.env.DATA_DIR ?? join(process.cwd(), "data");
const STORAGE_PATH = join(DATA_DIR, "events.json");

function ensureStorage(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!existsSync(STORAGE_PATH)) {
    writeFileSync(STORAGE_PATH, "[]");
  }
}

function readEvents(): CalendarEvent[] {
  try {
    ensureStorage();
    const data = readFileSync(STORAGE_PATH, "utf-8");
    return JSON.parse(data) as CalendarEvent[];
  } catch {
    return [];
  }
}

function writeEvents(events: CalendarEvent[]): void {
  ensureStorage();
  writeFileSync(STORAGE_PATH, JSON.stringify(events, null, 2));
}

export function getAllEvents(): CalendarEvent[] {
  return readEvents();
}

export function getEventById(id: string): CalendarEvent | undefined {
  return readEvents().find((e) => e.id === id);
}

export function createEvent(
  data: Omit<CalendarEvent, "id">
): CalendarEvent {
  const events = readEvents();
  const event: CalendarEvent = { id: randomUUID(), ...data };
  events.push(event);
  writeEvents(events);
  return event;
}

export function updateEvent(
  id: string,
  data: Partial<Omit<CalendarEvent, "id">>
): CalendarEvent | null {
  const events = readEvents();
  const index = events.findIndex((e) => e.id === id);
  if (index === -1) return null;
  events[index] = { ...events[index], ...data };
  writeEvents(events);
  return events[index];
}

export function deleteEvent(id: string): boolean {
  const events = readEvents();
  const filtered = events.filter((e) => e.id !== id);
  if (filtered.length === events.length) return false;
  writeEvents(filtered);
  return true;
}

export function findEventsByTitle(title: string): CalendarEvent[] {
  const lower = title.toLowerCase();
  return readEvents().filter((e) => e.title.toLowerCase().includes(lower));
}
