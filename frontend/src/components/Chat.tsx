import { useState, useRef, useEffect, FormEvent } from "react";
import { useEventStore } from "../store/eventStore";
import { api } from "../services/api";
import { Message } from "./Message";
import { ConfirmationCard } from "./ConfirmationCard";

const SUGGESTIONS = [
  "Schedule gym tomorrow at 7pm",
  "What do I have this week?",
  "Move gym to Friday",
  "Delete gym",
];

const MUTATING_INTENTS = new Set(["create_event", "update_event", "delete_event"]);

export function Chat() {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = useEventStore((s) => s.messages);
  const pendingAction = useEventStore((s) => s.pendingAction);
  const isLoading = useEventStore((s) => s.isLoading);
  const addMessage = useEventStore((s) => s.addMessage);
  const setPipelineStep = useEventStore((s) => s.setPipelineStep);
  const setPendingAction = useEventStore((s) => s.setPendingAction);
  const setLoading = useEventStore((s) => s.setLoading);
  const executePendingAction = useEventStore((s) => s.executePendingAction);
  const cancelPendingAction = useEventStore((s) => s.cancelPendingAction);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingAction]);

  async function handleSend(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setInput("");
    const history = useEventStore
      .getState()
      .messages.map((m) => ({ role: m.role, content: m.content }));
    addMessage("user", trimmed);
    setLoading(true);
    setPipelineStep("user_message");

    await delay(300);
    setPipelineStep("intent_detection");

    try {
      const response = await api.sendMessage(trimmed, history);

      await delay(200);
      setPipelineStep("structured_output");

      await delay(200);
      setPipelineStep("validation");

      if (response.intent === "unknown") {
        addMessage(
          "assistant",
          response.message ?? "I couldn't understand that request."
        );
        setPipelineStep("idle");
        return;
      }

      if (response.intent === "list_events") {
        addMessage("assistant", response.message ?? "No events found.");
        setPipelineStep("idle");
        return;
      }

      if (MUTATING_INTENTS.has(response.intent)) {
        await delay(200);
        setPipelineStep("confirmation");
        setPendingAction({
          intent: response.intent,
          arguments: response.arguments,
        });

        const actionLabel =
          response.intent === "create_event"
            ? "I parsed your request. Please confirm to create the event."
            : response.intent === "update_event"
              ? "I parsed your request. Please confirm to update the event."
              : "I parsed your request. Please confirm to delete the event.";

        addMessage("assistant", actionLabel);
        return;
      }

      setPipelineStep("idle");
    } catch {
      addMessage("assistant", "Something went wrong. Please try again.");
      setPipelineStep("idle");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    handleSend(input);
  }

  async function handleConfirm() {
    await executePendingAction();
    addMessage("assistant", "Done! Your calendar has been updated.");
  }

  return (
    <div className="flex flex-col h-full rounded-xl border border-surface-border bg-surface-raised">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="text-center py-4 sm:py-6 space-y-3">
            <p className="text-gray-500 text-sm">
              Ask me to schedule, move, or delete events.
            </p>
            <div className="flex flex-wrap gap-2 justify-center px-1">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-surface-border text-gray-400 hover:text-gray-200 hover:border-accent/50 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}

        {pendingAction && (
          <ConfirmationCard
            action={pendingAction}
            onConfirm={handleConfirm}
            onCancel={cancelPendingAction}
          />
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-surface-border/60 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-surface-border p-3 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Schedule gym tomorrow at 7pm..."
          disabled={isLoading}
          className="flex-1 rounded-lg bg-surface border border-surface-border px-4 py-2.5 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-accent/60 transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  );
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
