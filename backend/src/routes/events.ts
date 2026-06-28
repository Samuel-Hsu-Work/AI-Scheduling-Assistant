import { Router } from "express";
import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../services/eventService.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json(getAllEvents());
});

router.post("/", (req, res) => {
  const { title, start, end, description, location } = req.body;
  if (!title || !start || !end) {
    res.status(400).json({ error: "title, start, and end are required" });
    return;
  }
  const event = createEvent({ title, start, end, description, location });
  res.status(201).json(event);
});

router.put("/:id", (req, res) => {
  const event = updateEvent(req.params.id, req.body);
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.json(event);
});

router.delete("/:id", (req, res) => {
  const deleted = deleteEvent(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.status(204).send();
});

export default router;
