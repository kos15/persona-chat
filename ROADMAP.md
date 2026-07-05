# 🗺️ Project Roadmap — Persona Chat (Hitesh Choudhary & Piyush Garg)

This document explains **how the project was approached end-to-end**: the goal, the
architecture, the phases of work, and how each grading criterion is addressed.

---

## 1. Goal

Build an AI-powered website where a user can hold a natural, streaming conversation
with an AI recreation of **Hitesh Choudhary** *or* **Piyush Garg**, switching
between them at any time. Each persona must reproduce that person's **voice,
vocabulary, and teaching approach** using only publicly available material.

---

## 2. High-level architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Browser (client)                       │
│  Next.js React UI                                             │
│  • PersonaSwitcher (Hitesh ⇄ Piyush, one thread each)         │
│  • ChatMessage (Markdown + code blocks) / ChatInput           │
│  • Streaming reader → renders tokens as they arrive           │
└───────────────┬──────────────────────────────────────────────┘
                │ POST /api/chat  { personaId, messages[] }
                ▼
┌──────────────────────────────────────────────────────────────┐
│              Next.js Route Handler (server / edge)            │
│  1. Validate request + persona                               │
│  2. buildMessages():                                         │
│       [system persona] + [memory summary] +                  │
│       [few-shot] + [sliding-window recent turns]             │
│  3. Call OpenAI Chat Completions (stream: true)              │
│  4. Pipe tokens back as a ReadableStream                     │
│                                                              │
│  🔑 OPENAI_API_KEY stays server-side — never sent to browser │
└───────────────┬──────────────────────────────────────────────┘
                │
                ▼
        OpenAI Chat Completions API (gpt-4o-mini)
```

**Why this shape**

- **Next.js full-stack (App Router)** keeps the UI and the LLM proxy in one repo
  and deploys to Vercel in one click. The API route protects the key.
- **Streaming** gives the responsive, "typing" feel that makes a persona feel alive.
- **Persona logic lives in one file** (`lib/personas.js`) so tuning voice never
  touches UI or transport code — clean separation of concerns.

---

## 3. Tech stack

| Layer            | Choice                                   | Why                                            |
|------------------|------------------------------------------|------------------------------------------------|
| Framework        | Next.js 14 (App Router)                  | One repo, API routes, first-class Vercel deploy |
| UI               | React 18 + Tailwind CSS                  | Fast, clean, responsive, easy theming per persona |
| Markdown render  | react-markdown + remark-gfm             | Renders code blocks, lists, links in replies    |
| LLM              | OpenAI `gpt-4o-mini` (configurable)      | Strong instruction-following, cheap, fast       |
| Hosting          | Vercel                                   | Zero-config Next.js hosting, env-var secrets    |

---

## 4. Phases of work

### Phase 0 — Persona research (data collection)
Study publicly available content for each person: their personal sites
(`hitesh.ai`, `piyushgarg.dev`), YouTube channels, course pages, LinkedIn/X posts,
and interviews. Extract a **style fingerprint**: catchphrases, sentence rhythm,
language mix (Hinglish), analogies, teaching philosophy, and background facts.
→ Documented in [`docs/DATA_COLLECTION.md`](docs/DATA_COLLECTION.md).

### Phase 1 — Persona modelling (prompt engineering)
Convert each fingerprint into a structured **system prompt** + **few-shot
examples**. Iterate on wording, guardrails, and anti-"AI-assistant" instructions.
→ Documented in [`docs/PROMPT_ENGINEERING.md`](docs/PROMPT_ENGINEERING.md).

### Phase 2 — Backend (LLM integration)
Build the streaming `/api/chat` route: validate input, assemble context, call
OpenAI with streaming, pipe tokens back. Keep the key server-side.

### Phase 3 — Context management
Sliding window over recent turns + condensed summary of older turns, so the
persona stays coherent across long chats without unbounded token cost.
→ Documented in [`docs/CONTEXT_MANAGEMENT.md`](docs/CONTEXT_MANAGEMENT.md).

### Phase 4 — Frontend / UX
Chat UI with per-persona theming, a clear switcher, streaming render with a
typing caret, Markdown/code formatting, starter suggestion chips, stop button,
per-persona threads, and "new chat" reset.

### Phase 5 — Documentation
README (setup/run), the four required docs, and sample conversations.
→ [`docs/SAMPLE_CONVERSATIONS.md`](docs/SAMPLE_CONVERSATIONS.md).

### Phase 6 — Deploy & verify
`next build` locally, push to GitHub, deploy to Vercel with `OPENAI_API_KEY` set.

---

## 5. How each evaluation criterion is met

| Criterion (marks) | How this project addresses it |
|---|---|
| **Persona Accuracy (30)** | Deeply researched, structured system prompts capturing Hitesh's warm Hinglish "Haanji"/chai style and Piyush's direct, project-first voice; few-shot examples anchor tone; guardrails keep it in character. |
| **Conversation Quality (25)** | Full history sent within a sliding window + summarized memory of older turns → context-aware, coherent, persona-consistent even in long chats. Temperature/penalty tuning keeps replies helpful and non-repetitive. |
| **Technical Implementation (25)** | Clean separation: `lib/personas.js` (voice), `lib/context.js` (memory), `app/api/chat` (transport), `components/*` (UI). Server-side key, input validation, streaming, error handling. |
| **User Experience (20)** | One-tap persona switch with independent threads, per-persona color theming, streaming typing caret, Markdown + code rendering, suggestion chips, auto-scroll, stop/reset, mobile-responsive. |

---

## 6. Possible extensions (future work)

- **RAG over transcripts:** embed real YouTube transcripts in a vector DB and
  retrieve relevant snippets per query for even higher fidelity.
- **Voice mode:** TTS with a matching voice profile.
- **Persistence:** save threads to a DB so conversations survive refreshes.
- **More personas:** the architecture adds a new persona by appending one object
  to `lib/personas.js` — no other code changes required.
