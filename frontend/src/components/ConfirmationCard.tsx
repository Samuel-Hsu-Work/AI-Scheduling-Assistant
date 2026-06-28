import type { PendingAction } from "../types";

type Props = {
  action: PendingAction;
  onConfirm: () => void;
  onCancel: () => void;
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  let dayLabel: string;
  if (isSameDay(d, today)) dayLabel = "Today";
  else if (isSameDay(d, tomorrow)) dayLabel = "Tomorrow";
  else
    dayLabel = d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });

  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${dayLabel}\n${time}`;
}

const INTENT_LABELS: Record<string, string> = {
  create_event: "Create event?",
  update_event: "Update event?",
  delete_event: "Delete event?",
};

export function ConfirmationCard({ action, onConfirm, onCancel }: Props) {
  const { intent, arguments: args } = action;
  const label = INTENT_LABELS[intent] ?? "Confirm action?";

  return (
    <div className="rounded-xl border border-accent/40 bg-accent-muted/30 p-4 space-y-3">
      <p className="text-sm font-semibold text-accent-hover">{label}</p>

      <div className="space-y-2 text-sm">
        {Boolean(args.title || args.newTitle) && (
          <div className="flex gap-2">
            <span className="text-gray-500 w-14 shrink-0">Title:</span>
            <span className="text-gray-200">
              {String(args.newTitle ?? args.title)}
            </span>
          </div>
        )}
        {Boolean(args.start) && (
          <div className="flex gap-2">
            <span className="text-gray-500 w-14 shrink-0">Time:</span>
            <span className="text-gray-200 whitespace-pre-line">
              {formatDateTime(String(args.start))}
            </span>
          </div>
        )}
        {intent === "delete_event" && Boolean(args.title) && (
          <div className="flex gap-2">
            <span className="text-gray-500 w-14 shrink-0">Event:</span>
            <span className="text-gray-200">{String(args.title)}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={onConfirm}
          className="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
        >
          Confirm
        </button>
        <button
          onClick={onCancel}
          className="flex-1 rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
