import { Router } from "express";
import { parseUserMessage, summarizeEvents } from "../services/openai.js";
import { getAllEvents } from "../services/eventService.js";

const router = Router();

router.post("/", async (req, res) => {
  const { message, history } = req.body;
  if (!message || typeof message !== "string") {
    res.status(400).json({ error: "message is required" });
    return;
  }

  const chatHistory: { role: "user" | "assistant"; content: string }[] =
    Array.isArray(history)
      ? history.flatMap((h: unknown) => {
          if (
            typeof h === "object" &&
            h !== null &&
            "role" in h &&
            "content" in h &&
            (h.role === "user" || h.role === "assistant") &&
            typeof h.content === "string"
          ) {
            return [{ role: h.role, content: h.content }];
          }
          return [];
        })
      : [];

  const intent = await parseUserMessage(message, chatHistory);

  if (intent.intent === "list_events") {
    const { start, end } = intent.arguments as {
      start?: string;
      end?: string;
    };
    let events = getAllEvents();

    if (start) {
      events = events.filter((e) => new Date(e.start) >= new Date(start));
    }
    if (end) {
      events = events.filter((e) => new Date(e.start) <= new Date(end));
    }

    events.sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );

    res.json({
      ...intent,
      message: summarizeEvents(events),
      events,
    });
    return;
  }

  res.json(intent);
});

export default router;
