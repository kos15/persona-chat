"use client";

// components/ChatInput.jsx
// Auto-growing textarea + send/stop button. Enter sends, Shift+Enter newline.

import { useEffect, useRef, useState } from "react";

export default function ChatInput({ persona, onSend, onStop, isStreaming }) {
  const [value, setValue] = useState("");
  const taRef = useRef(null);

  // Auto-resize the textarea up to a max height.
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, [value]);

  const submit = () => {
    if (!value.trim() || isStreaming) return;
    onSend(value);
    setValue("");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="sticky bottom-0 py-3">
      <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
        <textarea
          ref={taRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={`Message ${persona.name}…`}
          className="scroll-slim max-h-40 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
        />
        {isStreaming ? (
          <button
            onClick={onStop}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-white transition hover:bg-slate-700"
            title="Stop generating"
            aria-label="Stop generating"
          >
            <span className="h-3 w-3 rounded-sm bg-white" />
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={!value.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition disabled:opacity-30"
            style={{ backgroundColor: persona.accent }}
            title="Send"
            aria-label="Send message"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 12l16-8-6 8 6 8-16-8z"
                fill="currentColor"
              />
            </svg>
          </button>
        )}
      </div>
      <p className="mt-1.5 text-center text-[10px] text-slate-400">
        AI recreation for educational purposes · not affiliated with{" "}
        {persona.name}. Enter to send · Shift+Enter for newline.
      </p>
    </div>
  );
}
