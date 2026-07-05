"use client";

// components/PersonaSwitcher.jsx
// Segmented toggle to switch between personas. Each thread is preserved.

export default function PersonaSwitcher({ personas, activeId, onSwitch, disabled }) {
  return (
    <div
      role="tablist"
      aria-label="Choose a persona"
      className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white/60 p-1.5 shadow-sm"
    >
      {personas.map((p) => {
        const active = p.id === activeId;
        return (
          <button
            key={p.id}
            role="tab"
            aria-selected={active}
            disabled={disabled}
            onClick={() => onSwitch(p.id)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition disabled:cursor-not-allowed ${
              active ? "shadow-sm" : "hover:bg-slate-50"
            }`}
            style={
              active
                ? { backgroundColor: p.accentSoft, outline: `1.5px solid ${p.accent}` }
                : undefined
            }
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: p.accent }}
            >
              {p.initials}
            </span>
            <span className="min-w-0">
              <span
                className="block truncate text-sm font-semibold"
                style={{ color: active ? p.accent : "#334155" }}
              >
                {p.name}
              </span>
              <span className="block truncate text-[11px] leading-tight text-slate-500">
                {p.tagline}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
