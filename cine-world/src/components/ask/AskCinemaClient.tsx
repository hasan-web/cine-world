"use client";

import { useEffect, useRef, useState } from "react";
import { askCinema } from "@/app/ask/actions";

interface DisplayMessage {
  role: "user" | "assistant";
  content: string;
  isGreeting?: boolean;
}

const GREETING: DisplayMessage = {
  role: "assistant",
  isGreeting: true,
  content:
    "Ask me anything about your collection — what connects your favorites, what to watch tonight, how your taste has moved.",
};

const PROMPT_CHIPS = [
  "What connects my Lacrima films?",
  "Something to rewatch tonight",
  "How has my taste shifted this year?",
  "Pick something from what's still unplaced",
];

export function AskCinemaClient() {
  const [messages, setMessages] = useState<DisplayMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pending]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pending) return;

    setError(null);
    const history = messages.filter((m) => !m.isGreeting).map(({ role, content }) => ({ role, content }));
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setPending(true);

    const result = await askCinema(trimmed, history);
    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setMessages((prev) => [...prev, { role: "assistant", content: result.answer ?? "" }]);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {PROMPT_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => send(chip)}
            disabled={pending}
            className="rounded-full border border-line-strong px-3.5 py-1.5 text-[11.5px] text-ink-soft hover:border-accent hover:text-accent-strong disabled:opacity-50"
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="glass flex flex-col gap-2.5 p-4">
        <div className="flex max-h-[420px] flex-col gap-2.5 overflow-y-auto">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-[1.6] ${
                m.role === "user"
                  ? "ml-auto bg-accent-soft text-ink"
                  : "border border-line bg-glass-edge text-ink"
              }`}
            >
              {m.content}
            </div>
          ))}
          {pending && (
            <div className="max-w-[88%] rounded-2xl border border-line bg-glass-edge px-3.5 py-2.5 text-[12.5px] text-ink-faint italic">
              thinking…
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {error && <p className="text-[11.5px] text-accent-strong">{error}</p>}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 border-t border-line pt-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your collection…"
            className="flex-1 bg-transparent text-[12.5px] text-ink outline-none placeholder:text-ink-faint"
          />
          <button
            type="submit"
            disabled={pending || !input.trim()}
            aria-label="Send"
            className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-strong disabled:opacity-40"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 11V3M3 6l4-4 4 4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
