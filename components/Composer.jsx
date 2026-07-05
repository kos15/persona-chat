"use client";

// components/Composer.jsx
// The starter "suggestion chips" shown at the top of a fresh conversation.

export default function Composer({ persona, onPick, disabled }) {
  return (
    <div className="mt-5 animate-fade-in-up">
      <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-slate-400">
        Try asking
      </p>
      <div className="flex flex-wrap gap-2">
        {persona.suggestions.map((q) => (
          <button
            key={q}
            disabled={disabled}
            onClick={() => onPick(q)}
            className="rounded-full border bg-white px-3.5 py-2 text-left text-xs text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow disabled:opacity-40"
            style={{ borderColor: persona.accent + "44" }}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
