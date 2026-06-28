import "dotenv/config";
import express from "express";
import cors from "cors";
import eventsRouter from "./routes/events.js";
import chatRouter from "./routes/chat.js";
import { getStoragePath } from "./services/eventService.js";

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL?.replace(/\/$/, "");

app.use(
  cors({
    origin: FRONTEND_URL || true,
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", storage: getStoragePath() });
});

app.use("/events", eventsRouter);
app.use("/chat", chatRouter);

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Event storage: ${getStoragePath()}`);
});
