# 🧵 Context Management Approach

Implemented in `lib/context.js` and consumed by `app/api/chat/route.js`.
The goal: keep conversations **coherent and persona-consistent over many turns**
without letting token usage (and cost/latency) grow without bound.

---

## 1. The problem

LLMs are stateless — each request must carry the whole conversation. Sending the
entire history every time is simple but:
- gets expensive and slow as the chat grows,
- eventually overflows the context window.

Dropping history naively makes the persona "forget" your name, your goal, or what
it already explained — hurting **Conversation Quality**.

---

## 2. The strategy: sliding window + summarized memory

`buildMessages(personaId, clientHistory)` assembles the final payload as:

```
[ system: persona prompt ]
[ system: condensed memory of older turns ]   ← only if the chat is long
[ few-shot example turns ]
[ recent turns, verbatim (sliding window) ]
```

### a) Sliding window
The **most recent `MAX_HISTORY_MESSAGES` (12)** user/assistant messages are always
sent verbatim, so immediate context is pixel-perfect.

### b) Summarized memory
Anything **older** than the window is condensed by `summarizeOlder()` into a short
bulleted digest and injected as a system note ("Earlier in this same
conversation…"). This preserves long-term facts (the learner's name, their stack,
goals, what's been covered) at a fraction of the tokens.

> The current summariser is a fast, deterministic **extractive** digest (truncated
> per-line). It is intentionally pluggable — see §5 for the LLM-summary upgrade.

---

## 3. Per-persona threads (client side)

In `components/ChatApp.jsx`, each persona has its **own independent message
thread**. Switching from Hitesh to Piyush does not mix contexts — you resume each
conversation exactly where you left it, and neither persona sees the other's chat.

---

## 4. Safety & robustness

- **`sanitizeHistory()`** never trusts the client blindly: it accepts only
  `user`/`assistant` roles with non-empty string content and clamps each message
  to 8,000 chars (prevents payload abuse / prompt-injection via giant inputs).
- **Server rebuilds context** from scratch every request — the system prompt and
  few-shot are added server-side, so a malicious client can't overwrite the
  persona.
- **Streaming** is wrapped in try/finally so the stream always closes cleanly,
  even on mid-generation errors.

---

## 5. Tuning knobs & future upgrades

| Knob | Where | Effect |
|---|---|---|
| `MAX_HISTORY_MESSAGES` | `lib/context.js` | Bigger window = more verbatim recall, more tokens |
| `estimateTokens()` | `lib/context.js` | Swap for real tokenizer for exact budgeting |
| `summarizeOlder()` | `lib/context.js` | Replace extractive digest with an LLM-generated running summary |
| `max_tokens` / penalties | `app/api/chat/route.js` | Response length & repetition control |

**Planned upgrade:** replace the extractive digest with a cheap secondary LLM call
that maintains a rolling natural-language summary, and add **RAG** retrieval of
real transcript snippets for factual grounding — both slot into `buildMessages()`
without touching the UI or transport layers.
