// lib/context.js
// -----------------------------------------------------------------------------
// Context-management helpers.
//
// LLM context windows are finite and every token costs money + latency, so we
// don't blindly send the entire chat history on every request. This module:
//   1. Builds the final message array sent to OpenAI (system + few-shot + turns)
//   2. Keeps a rolling window of the most recent turns (sliding window)
//   3. Optionally condenses older turns into a short running summary so the
//      persona keeps long-term context without unbounded token growth.
//
// See docs/CONTEXT_MANAGEMENT.md for the full strategy write-up.
// -----------------------------------------------------------------------------

import { getPersona } from "./personas";

// How many of the most recent user/assistant messages to keep verbatim.
export const MAX_HISTORY_MESSAGES = 12;

// Very rough token estimate (~4 chars/token). Good enough for budgeting;
// we are not doing exact tokenization on the edge.
export function estimateTokens(text = "") {
  return Math.ceil(text.length / 4);
}

/**
 * Sanitize + clamp the incoming client history to a safe shape.
 * We never trust the client blindly: only `user`/`assistant` roles,
 * string content, and a hard cap on how much we accept.
 */
export function sanitizeHistory(messages = []) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    )
    .map((m) => ({ role: m.role, content: m.content.slice(0, 8000) }));
}

/**
 * Apply a sliding window over the conversation. We always keep the last
 * MAX_HISTORY_MESSAGES turns verbatim. Anything older is returned separately
 * so the caller can summarize it if desired.
 */
export function windowHistory(history, max = MAX_HISTORY_MESSAGES) {
  if (history.length <= max) return { recent: history, older: [] };
  return {
    recent: history.slice(-max),
    older: history.slice(0, -max),
  };
}

/**
 * Compress older turns into a compact plain-text digest that we inject as a
 * system note. This preserves long-term context (names, goals, what was
 * already explained) while collapsing token usage.
 */
export function summarizeOlder(older) {
  if (!older.length) return null;
  const lines = older.map((m) => {
    const who = m.role === "user" ? "User" : "You";
    const text = m.content.replace(/\s+/g, " ").slice(0, 220);
    return `- ${who}: ${text}`;
  });
  return (
    "Earlier in this same conversation (condensed for memory). " +
    "Stay consistent with what was already discussed:\n" +
    lines.join("\n")
  );
}

/**
 * Build the full message array to send to the model:
 *   [system persona] [optional memory summary] [few-shot] [recent turns]
 */
export function buildMessages(personaId, clientHistory) {
  const persona = getPersona(personaId);
  const history = sanitizeHistory(clientHistory);
  const { recent, older } = windowHistory(history);

  const messages = [{ role: "system", content: persona.systemPrompt }];

  const memory = summarizeOlder(older);
  if (memory) {
    messages.push({ role: "system", content: memory });
  }

  // Few-shot examples anchor the persona's tone via in-context learning.
  if (Array.isArray(persona.fewShot)) {
    for (const ex of persona.fewShot) messages.push(ex);
  }

  for (const turn of recent) messages.push(turn);

  return { persona, messages };
}
