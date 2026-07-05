"use client";

// components/ChatApp.jsx
// -----------------------------------------------------------------------------
// Top-level client component. Owns all chat state, the streaming fetch to
// /api/chat, and per-persona conversation memory. Persona switching keeps a
// separate message thread per persona so you can flip between them freely.
// -----------------------------------------------------------------------------

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PERSONA_LIST, DEFAULT_PERSONA } from "@/lib/personas";
import PersonaSwitcher from "@/components/PersonaSwitcher";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import Composer from "@/components/Composer";
import ApiKeyModal from "@/components/ApiKeyModal";

const API_KEY_STORAGE = "persona-chat:openai-key";

function greetingMessage(persona) {
  return { role: "assistant", content: persona.greeting };
}

export default function ChatApp() {
  const personas = PERSONA_LIST;
  const [activeId, setActiveId] = useState(DEFAULT_PERSONA);

  // One independent thread per persona.
  const [threads, setThreads] = useState(() =>
    Object.fromEntries(
      personas.map((p) => [p.id, [greetingMessage(p)]])
    )
  );

  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);
  const scrollRef = useRef(null);

  // User-supplied OpenAI key. Lives only in this browser (localStorage).
  const [apiKey, setApiKey] = useState("");
  const [keyModalOpen, setKeyModalOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(API_KEY_STORAGE);
      if (saved) setApiKey(saved);
    } catch {
      /* localStorage unavailable — ignore */
    }
  }, []);

  const saveKey = useCallback((key) => {
    setApiKey(key);
    try {
      localStorage.setItem(API_KEY_STORAGE, key);
    } catch {
      /* ignore */
    }
    setKeyModalOpen(false);
    setError(null);
  }, []);

  const clearKey = useCallback(() => {
    setApiKey("");
    try {
      localStorage.removeItem(API_KEY_STORAGE);
    } catch {
      /* ignore */
    }
    setKeyModalOpen(false);
  }, []);

  const persona = useMemo(
    () => personas.find((p) => p.id === activeId),
    [personas, activeId]
  );
  const messages = threads[activeId];

  // Auto-scroll to the newest message as content streams in.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isStreaming]);

  const switchPersona = useCallback(
    (id) => {
      if (id === activeId || isStreaming) return;
      setError(null);
      setActiveId(id);
    },
    [activeId, isStreaming]
  );

  const resetThread = useCallback(() => {
    if (isStreaming) return;
    setError(null);
    setThreads((prev) => ({
      ...prev,
      [activeId]: [greetingMessage(persona)],
    }));
  }, [activeId, persona, isStreaming]);

  const send = useCallback(
    async (text) => {
      const content = text.trim();
      if (!content || isStreaming) return;
      setError(null);

      // Optimistically add the user's message + an empty assistant slot.
      const history = threads[activeId];
      const nextHistory = [
        ...history,
        { role: "user", content },
        { role: "assistant", content: "" },
      ];
      setThreads((prev) => ({ ...prev, [activeId]: nextHistory }));
      setIsStreaming(true);

      // We only send prior turns + the new user message (not the empty slot).
      const payloadMessages = [...history, { role: "user", content }]
        .filter((m) => m.content && m.content.length > 0)
        .map((m) => ({ role: m.role, content: m.content }));

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            personaId: activeId,
            messages: payloadMessages,
            ...(apiKey ? { apiKey } : {}),
          }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Request failed (${res.status})`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";

        // Stream tokens into the last (assistant) message.
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setThreads((prev) => {
            const thread = prev[activeId].slice();
            thread[thread.length - 1] = { role: "assistant", content: acc };
            return { ...prev, [activeId]: thread };
          });
        }
      } catch (err) {
        if (err.name === "AbortError") {
          // user stopped generation — keep whatever streamed so far
        } else {
          setError(err.message || "Something went wrong.");
          // Drop the empty assistant bubble on hard failure.
          setThreads((prev) => {
            const thread = prev[activeId].slice();
            if (thread.length && thread[thread.length - 1].content === "") {
              thread.pop();
            }
            return { ...prev, [activeId]: thread };
          });
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [activeId, threads, isStreaming, apiKey]
  );

  const stop = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
  }, []);

  const showIntro = messages.length <= 1;

  return (
    <div className="mx-auto flex h-[100dvh] max-w-3xl flex-col px-3 sm:px-4">
      {/* Header + persona switcher */}
      <header className="pt-4 sm:pt-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
              Chai, Code &amp; Personas
            </h1>
            <p className="text-xs text-slate-500">
              Chat with an AI recreation of your favourite dev educator.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setKeyModalOpen(true)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
              title={apiKey ? "Your API key is set — click to manage" : "Add your OpenAI API key"}
            >
              🔑 {apiKey ? "Key set" : "Add key"}
            </button>
            <button
              onClick={resetThread}
              disabled={isStreaming}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
              title="Clear this conversation"
            >
              New chat
            </button>
          </div>
        </div>
        <PersonaSwitcher
          personas={personas}
          activeId={activeId}
          onSwitch={switchPersona}
          disabled={isStreaming}
        />
      </header>

      {/* Messages */}
      <main
        ref={scrollRef}
        className="scroll-slim mt-4 flex-1 overflow-y-auto rounded-2xl border border-slate-200/70 bg-white/70 p-3 shadow-sm backdrop-blur-sm sm:p-5"
      >
        <div className="space-y-4">
          {messages.map((m, i) => (
            <ChatMessage
              key={i}
              role={m.role}
              content={m.content}
              persona={persona}
              streaming={
                isStreaming &&
                i === messages.length - 1 &&
                m.role === "assistant"
              }
            />
          ))}
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {showIntro && (
          <Composer
            persona={persona}
            onPick={(q) => send(q)}
            disabled={isStreaming}
          />
        )}
      </main>

      {/* Input */}
      <ChatInput
        persona={persona}
        onSend={send}
        onStop={stop}
        isStreaming={isStreaming}
      />

      <ApiKeyModal
        open={keyModalOpen}
        initialKey={apiKey}
        onClose={() => setKeyModalOpen(false)}
        onSave={saveKey}
        onClear={clearKey}
      />
    </div>
  );
}
