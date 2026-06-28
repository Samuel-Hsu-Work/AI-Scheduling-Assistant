import type { ChatMessage as ChatMessageType } from "../types";

type Props = {
  message: ChatMessageType;
};

export function Message({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-accent text-white rounded-br-md"
            : "bg-surface-border/60 text-gray-200 rounded-bl-md"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
