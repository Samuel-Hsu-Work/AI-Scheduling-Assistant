import type { PipelineStep } from "../types";

const STEPS: { key: PipelineStep; label: string; short: string }[] = [
  { key: "user_message", label: "User Message", short: "Message" },
  { key: "intent_detection", label: "Intent Detection", short: "Intent" },
  { key: "structured_output", label: "Structured Tool Output", short: "Output" },
  { key: "validation", label: "Validation", short: "Validate" },
  { key: "confirmation", label: "Confirmation", short: "Confirm" },
  { key: "crud_execution", label: "CRUD Execution", short: "Execute" },
  { key: "calendar_updated", label: "Calendar Updated", short: "Done" },
];

const ORDER: PipelineStep[] = STEPS.map((s) => s.key);

function stepIndex(step: PipelineStep): number {
  if (step === "idle") return -1;
  return ORDER.indexOf(step);
}

type Props = {
  currentStep: PipelineStep;
};

export function AgentPipeline({ currentStep }: Props) {
  const activeIdx = stepIndex(currentStep);

  return (
    <div className="h-full rounded-xl border border-surface-border bg-surface-raised p-3 sm:p-4 overflow-hidden flex flex-col">
      {/* Vertical layout — md+ right column */}
      <div className="hidden md:flex flex-col flex-1 min-h-0 overflow-y-auto">
        {STEPS.map((step, i) => {
          const isActive = i === activeIdx;
          const isDone = activeIdx > i;
          const isPending = activeIdx < i;

          return (
            <div key={step.key} className="flex items-start gap-2.5 shrink-0">
              <div className="flex flex-col items-center">
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 transition-all duration-300 ${
                    isActive
                      ? "bg-accent ring-4 ring-accent/30 scale-125"
                      : isDone
                        ? "bg-emerald-500"
                        : "bg-surface-border"
                  }`}
                />
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-px flex-1 min-h-[12px] transition-colors duration-300 ${
                      isDone ? "bg-emerald-500/50" : "bg-surface-border"
                    }`}
                  />
                )}
              </div>
              <p
                className={`text-xs leading-snug pb-2 transition-colors duration-300 ${
                  isActive
                    ? "text-accent-hover font-medium"
                    : isDone
                      ? "text-emerald-400"
                      : isPending
                        ? "text-gray-600"
                        : "text-gray-500"
                }`}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Horizontal layout — mobile */}
      <div className="flex md:hidden items-center gap-1 overflow-x-auto pb-1">
        {STEPS.map((step, i) => {
          const isActive = i === activeIdx;
          const isDone = activeIdx > i;

          return (
            <div key={step.key} className="flex items-center gap-1 shrink-0">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    isActive
                      ? "bg-accent ring-4 ring-accent/30"
                      : isDone
                        ? "bg-emerald-500"
                        : "bg-surface-border"
                  }`}
                />
                <span
                  className={`text-[10px] whitespace-nowrap transition-colors duration-300 ${
                    isActive
                      ? "text-accent-hover font-medium"
                      : isDone
                        ? "text-emerald-400"
                        : "text-gray-600"
                  }`}
                >
                  {step.short}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-4 h-px mb-4 transition-colors duration-300 ${
                    isDone ? "bg-emerald-500/50" : "bg-surface-border"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
