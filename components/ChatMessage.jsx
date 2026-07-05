"use client";

// components/ChatMessage.jsx
// A single chat bubble. Assistant messages render Markdown (code blocks, lists,
// bold, links). User messages render as plain text in an accent bubble.

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatMessage({ role, content, persona, streaming }) {
  const isUser = role === "user";

  if (isUser) {
    return (
      <div className="flex animate-fade-in-up justify-end">
        <div
          className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md px-4 py-2.5 text-sm text-white shadow-sm"
          style={{ backgroundColor: persona.accent }}
        >
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex animate-fade-in-up items-start gap-2.5">
      <span
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
        style={{ backgroundColor: persona.accent }}
        aria-hidden
      >
        {persona.initials}
      </span>
      <div className="max-w-[85%] rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm">
        {content ? (
          <div className="prose-chat">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        ) : null}
        {streaming && (
          <span
            className="ml-0.5 inline-block h-3 w-2 translate-y-0.5 animate-blink rounded-sm"
            style={{ backgroundColor: persona.accent }}
            aria-label="typing"
          />
        )}
      </div>
    </div>
  );
}
