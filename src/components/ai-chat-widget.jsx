import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { chatCompletion } from "@/lib/chat.functions";

type Msg = { role: "user" | "assistant"; content };

const STORAGE_KEY = "pm_chat_history";
const WELCOME = {
  role: "assistant",
  content:
    "Hi 👋 I'm Mogul Assistant. Ask me about listings, neighborhoods, financing, or booking a viewing.",
};

const QUICK_PROMPTS = [
  "Show 3-bed homes in Lekki",
  "Cheapest office space in Abuja",
  "Explain the mortgage process",
];

function Icon({ name, className = "" }: { name; className? }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontVariationSettings: "'FILL' 0, 'wght' 500" }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

export function AiChatWidget({
  open,
  onClose,
}: {
  open;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chat = useServerFn(chatCompletion);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const triggerRef = useRef(null);

  // Restore history
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw)[];
        if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Persist history
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* ignore */
    }
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
  }, [messages, loading]);

  // Focus management: focus input on open, restore trigger focus on close
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement | null;
      setTimeout(() => inputRef.current?.focus(), 50);
    } else if (triggerRef.current) {
      triggerRef.current.focus();
    }
  }, [open]);

  const sendText = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { reply } = await chat({ data: { messages: next } });
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: e instanceof Error ? e.message : "Something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([WELCOME]);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  if (!open) return null;
  const showQuickPrompts = messages.length <= 1 && !loading;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none" role="dialog" aria-modal="true" aria-label="Mogul Assistant chat">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm pointer-events-auto sm:hidden"
        onClick={onClose}
      />
      <div className="pointer-events-auto absolute bottom-4 right-4 left-4 sm:left-auto sm:w-[400px] max-h-[80vh] flex flex-col bg-surface-container-lowest border border-border-muted rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-border-muted bg-surface-container">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-container to-secondary flex items-center justify-center text-on-primary-container">
            
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-on-surface truncate">Mogul Assistant</p>
            <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success-cyan animate-pulse" />
              Online · AI powered
            </p>
          </div>
          <button
            onClick={resetChat}
            aria-label="Clear conversation"
            title="Clear conversation"
            className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-background transition-colors"
          >
            
          </button>
          <button
            onClick={onClose}
            aria-label="Close chat"
            className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-background transition-colors"
          >
            
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-primary-container text-on-primary-container rounded-br-md"
                    : "bg-surface-container text-on-surface rounded-bl-md border border-border-muted"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start" aria-live="polite" aria-label="Assistant is typing">
              <div className="bg-surface-container border border-border-muted px-4 py-2.5 rounded-2xl rounded-bl-md">
                <span className="inline-flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary-container animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-primary-container animate-bounce [animation-delay:0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-primary-container animate-bounce [animation-delay:0.3s]" />
                </span>
              </div>
            </div>
          )}

          {showQuickPrompts && (
            <div className="pt-2 flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  onClick={() => void sendText(q)}
                  className="text-xs bg-surface-container border border-border-muted text-on-surface-variant px-3 py-2 rounded-full hover:border-primary-container hover:text-primary transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void sendText(input);
          }}
          className="p-3 border-t border-border-muted bg-surface-container flex items-center gap-2"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a property, price, area…"
            aria-label="Message"
            className="flex-1 bg-background border border-border-muted rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-container"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send message"
            className="w-11 h-11 shrink-0 grid place-items-center rounded-xl bg-primary-container text-on-primary-container disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
          >
            
          </button>
        </form>
      </div>
    </div>
  );
}