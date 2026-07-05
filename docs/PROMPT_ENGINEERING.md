# 🧠 Prompt Engineering Strategy

The persona lives entirely in `lib/personas.js`. Each persona is a **system
prompt** + **few-shot examples** + UI metadata. This document explains the design.

---

## 1. Anatomy of a persona system prompt

Each system prompt is organised into labelled sections so the model can attend to
each concern cleanly:

1. **Identity & anti-assistant guardrail** — "You ARE Hitesh / Piyush. You are NOT
   a generic AI assistant. Never say you are an AI or language model."
   This is the single most important line for persona accuracy — it stops the
   model from defaulting to neutral ChatGPT voice.
2. **Background** — concrete, publicly-known facts the persona can reference
   naturally (companies, courses, career), so answers feel lived-in.
3. **Voice** — the heart of it: language mix (Hinglish), signature phrases, tone,
   and — crucially — **how often** to use catchphrases ("use 'Haanji', but don't
   overuse it"). Over-using a catchphrase is the #1 way personas feel fake.
4. **Teaching approach** — how they explain: analogy-first vs project-first,
   depth, use of code, career philosophy.
5. **Style rules** — length, formatting, emoji budget, and staying on-topic.

---

## 2. Few-shot anchoring

Each persona ships with a hand-written **example turn** (user question →
in-character answer). These do more than any description can: they show the model
the *exact rhythm* — Hitesh opening with "Haanji", using a chai analogy, then a
clean code block, then encouragement; Piyush leading with the point, then
production framing, then minimal code, then a "go build it" nudge.

The few-shot messages are injected **after** the system prompt and **before** the
live conversation in `lib/context.js → buildMessages()`.

---

## 3. Contrastive design (making the two feel different)

The two personas are intentionally engineered to **contrast**, so switching feels
meaningful:

| | Hitesh | Piyush |
|---|---|---|
| Opener | "Haanji…" | "Dekho / so basically…" |
| Metaphor | chai, patience, everyday life | production systems, real jobs |
| Pace | calm, thorough | fast, to-the-point |
| Emoji | ☕ 😊 (warm) | 🚀 🔥 (energetic) |
| Address | respectful "aap", "bhai" | peer-to-peer "yaar", "dekho" |

---

## 4. Decoding parameters (in `app/api/chat/route.js`)

| Param | Value | Reason |
|---|---|---|
| `temperature` | `0.8` | Human warmth and variety without going off the rails |
| `top_p` | `0.95` | Nucleus sampling for natural phrasing |
| `presence_penalty` | `0.3` | Avoid re-using the same catchphrase every message |
| `frequency_penalty` | `0.2` | Reduce repetitive wording across long chats |
| `max_tokens` | `900` | Room for a code block + explanation, not an essay |

---

## 5. Guardrails

- **No character breaks:** explicit instruction never to mention system prompts,
  personas, OpenAI, or being an AI.
- **Stay in lane:** each persona politely redirects clearly off-topic requests
  (their real domains are coding/tech/careers).
- **Tasteful catchphrase frequency:** prompts explicitly cap signature-phrase use.
- **Disclosure in UI:** the app footer states it's an AI recreation, not affiliated.

---

## 6. How to tune or add a persona

Adding a persona is a **single-file change** — append an object to `PERSONAS` in
`lib/personas.js` with: `id, name, tagline, accent, accentSoft, initials,
greeting, suggestions, systemPrompt, fewShot`. The switcher, theming, and routing
pick it up automatically. No UI or backend edits required.
