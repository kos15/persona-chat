"use client";

// components/ApiKeyModal.jsx
// -----------------------------------------------------------------------------
// Lets a visitor use their OWN OpenAI API key. The key is stored ONLY in the
// browser's localStorage and attached to each chat request. It is never saved
// to any database or server. See the disclaimer rendered below the input.
// -----------------------------------------------------------------------------

import { useEffect, useState } from "react";

export default function ApiKeyModal({ open, initialKey, onClose, onSave, onClear }) {
  const [value, setValue] = useState(initialKey || "");
  const [show, setShow] = useState(false);

  // Keep the field in sync when the modal is (re)opened.
  useEffect(() => {
    if (open) {
      setValue(initialKey || "");
      setShow(false);
    }
  }, [open, initialKey]);

  if (!open) return null;

  const trimmed = value.trim();
  const looksValid = trimmed.startsWith("sk-") && trimmed.length > 20;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="OpenAI API key settings"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              🔑 Your OpenAI API key
            </h2>
            <p className="text-xs text-slate-500">
              Use your own key to chat. Stored in this browser only.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <label className="mb-1 block text-xs font-medium text-slate-600">
          API key
        </label>
        <div className="flex gap-2">
          <input
            type={show ? "text" : "password"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="sk-..."
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
          <button
            onClick={() => setShow((s) => !s)}
            className="rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            type="button"
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>

        {/* Security disclaimer — required so users understand where the key goes. */}
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11px] leading-relaxed text-amber-800">
          <p className="mb-1 font-semibold">🔒 How your key is handled</p>
          <ul className="list-disc space-y-1 pl-4">
            <li>
              Saved <strong>only in this browser</strong> (localStorage). It is
              never written to any database or server-side storage.
            </li>
            <li>
              On each message it is sent over HTTPS to this app's
              <code className="mx-1 rounded bg-amber-100 px-1">/api/chat</code>
              route, which uses it once to call OpenAI, then discards it. It is
              not logged or persisted.
            </li>
            <li>
              Anyone with access to this browser/profile can read it. Use a key
              with usage limits, and remove it when done.
            </li>
            <li>
              This is an educational demo, not affiliated with OpenAI. You are
              responsible for your own key and its usage costs.
            </li>
          </ul>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            onClick={onClear}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            type="button"
          >
            Remove key
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(trimmed)}
              disabled={!looksValid}
              className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:opacity-40"
              type="button"
            >
              Save key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
