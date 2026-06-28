import { useEffect, type ReactNode } from "react";
import { Calendar } from "../components/Calendar";
import { Chat } from "../components/Chat";
import { AgentPipeline } from "../components/AgentPipeline";
import { useEventStore } from "../store/eventStore";

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest px-1 shrink-0">
      {children}
    </h2>
  );
}

export function Home() {
  const fetchEvents = useEventStore((s) => s.fetchEvents);
  const pipelineStep = useEventStore((s) => s.pipelineStep);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className="min-h-dvh flex flex-col lg:h-dvh lg:overflow-hidden">
      <header className="shrink-0 border-b border-surface-border px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="w-full flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold text-gray-100">
            AI Calendar Assistant
          </h1>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-accent-muted/40 text-accent-hover border border-accent/20">
            AI Agent
          </span>
        </div>
      </header>

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4 min-h-0 lg:overflow-hidden overflow-y-auto">
        {/* Top row: Chat + Agent Pipeline */}
        <div className="shrink-0 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(260px,30%)] gap-4 min-h-[260px] h-[clamp(260px,32vh,380px)]">
          <section className="flex flex-col gap-2 min-h-0 min-w-0">
            <SectionLabel>Chat</SectionLabel>
            <div className="flex-1 min-h-0">
              <Chat />
            </div>
          </section>

          <section className="flex flex-col gap-2 min-h-0 min-w-0">
            <SectionLabel>Agent Pipeline</SectionLabel>
            <div className="flex-1 min-h-0">
              <AgentPipeline currentStep={pipelineStep} />
            </div>
          </section>
        </div>

        {/* Bottom: Calendar */}
        <section className="flex flex-col gap-2 flex-1 min-h-[420px] lg:min-h-0">
          <SectionLabel>Calendar</SectionLabel>
          <div className="flex-1 min-h-[380px] lg:min-h-0">
            <Calendar />
          </div>
        </section>
      </main>
    </div>
  );
}
