import { lazy, Suspense, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { answerChat, CHAT_SUGGESTIONS } from "@shared/chatbot";
import { useLocale } from "../locale";
import type { AvatarMood } from "./AvatarScene";

const AvatarScene = lazy(() => import("./AvatarScene"));

interface ChatMessage {
  id: string;
  role: "bot" | "user";
  text: string;
  href?: string;
  hrefLabel?: string;
}

function canUseWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: false }) ||
      canvas.getContext("webgl", { failIfMajorPerformanceCaveat: false });
    const ok = Boolean(gl);
    const lose = gl?.getExtension?.("WEBGL_lose_context");
    lose?.loseContext();
    return ok;
  } catch {
    return false;
  }
}

export default function AssistantPanel({ onClose }: { onClose: () => void }) {
  const { locale, t } = useLocale();
  const [input, setInput] = useState("");
  const [mood, setMood] = useState<AvatarMood>("idle");
  const [webgl] = useState(() => {
    if (typeof window === "undefined") return false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return !reduced && canUseWebGL();
  });
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "hello",
      role: "bot",
      text: t.chatWelcome,
    },
  ]);

  function ask(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", text: trimmed },
    ]);
    setInput("");
    setMood("think");
    window.setTimeout(() => {
      const reply = answerChat(trimmed, locale);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "bot",
          text: reply.text,
          href: reply.href,
          hrefLabel: reply.hrefLabel,
        },
      ]);
      setMood("talk");
      window.setTimeout(() => setMood("idle"), 2200);
    }, 280);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    ask(input);
  }

  return (
    <div className="assistant-panel glass" role="dialog" aria-labelledby="assistant-title">
      <div className="flex items-start gap-3 border-b border-ink/10 p-3">
        <div className="assistant-stage h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-mist/70">
          {webgl ? (
            <Suspense fallback={<div className="h-full w-full bg-mist" />}>
              <AvatarScene mood={mood} />
            </Suspense>
          ) : (
            <img src="/aac-logo.png" alt="" className="h-full w-full object-contain p-3" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 id="assistant-title" className="text-base font-semibold text-ink">
            {t.chatTitle}
          </h2>
          <p className="mt-1 text-xs text-ink/65">{t.chatLead}</p>
        </div>
        <button
          type="button"
          className="min-h-10 min-w-10 rounded-full text-lg text-ink/70"
          onClick={onClose}
          aria-label={t.chatClose}
        >
          ×
        </button>
      </div>
      <div className="flex max-h-[min(50vh,22rem)] flex-col gap-2 overflow-y-auto p-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[92%] rounded-2xl px-3 py-2 text-sm ${
              message.role === "user" ? "ml-auto bg-clay text-white" : "bg-foam text-ink"
            }`}
          >
            <p>{message.text}</p>
            {message.href ? (
              message.href.startsWith("http") ? (
                <a
                  href={message.href}
                  className="mt-1 inline-block text-xs font-semibold underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {message.hrefLabel ?? message.href}
                </a>
              ) : (
                <Link to={message.href} className="mt-1 inline-block text-xs font-semibold text-clay" onClick={onClose}>
                  {message.hrefLabel ?? message.href}
                </Link>
              )
            ) : null}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 px-3 pb-2">
        {CHAT_SUGGESTIONS[locale].map((item) => (
          <button
            key={item}
            type="button"
            className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-ink"
            onClick={() => ask(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <form className="flex gap-2 border-t border-ink/10 p-3" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor="assistant-input">
          {t.chatPlaceholder}
        </label>
        <input
          id="assistant-input"
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            if (event.target.value) setMood("listen");
          }}
          className="min-h-11 flex-1 rounded-full border border-ink/15 bg-white px-4 text-sm"
          placeholder={t.chatPlaceholder}
        />
        <button
          type="submit"
          className="min-h-11 rounded-full bg-clay px-4 text-sm font-semibold text-white"
        >
          {t.chatSend}
        </button>
      </form>
    </div>
  );
}
