// app/api/chat/route.js
// -----------------------------------------------------------------------------
// The chat endpoint. Runs on the server so the OpenAI API key is never exposed
// to the browser. Streams tokens back to the client as they are generated for
// a responsive, ChatGPT-like typing experience.
// -----------------------------------------------------------------------------

import OpenAI from "openai";
import { buildMessages } from "@/lib/context";
import { PERSONAS } from "@/lib/personas";

// Edge-friendly streaming. (Node runtime also works; Edge gives lower latency.)
export const runtime = "edge";

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

export async function POST(req) {
  try {
    const body = await req.json();
    const { personaId, messages, apiKey } = body || {};

    if (!personaId || !PERSONAS[personaId]) {
      return Response.json({ error: "Unknown or missing personaId." }, { status: 400 });
    }
    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "`messages` must be a non-empty array." }, { status: 400 });
    }

    // Key resolution:
    //   1. A user-supplied key (from their browser) takes priority. It is used
    //      transiently for this one request only — never logged, never stored.
    //   2. Otherwise fall back to the server's own OPENAI_API_KEY (if set).
    const clientKey =
      typeof apiKey === "string" && apiKey.trim().startsWith("sk-")
        ? apiKey.trim()
        : null;
    const key = clientKey || process.env.OPENAI_API_KEY;

    if (!key) {
      return Response.json(
        {
          error:
            "No API key available. Add your own OpenAI key via the 🔑 button, or set OPENAI_API_KEY on the server.",
        },
        { status: 401 }
      );
    }

    // Build the persona-aware, context-managed message list.
    const { messages: finalMessages } = buildMessages(personaId, messages);

    const openai = new OpenAI({ apiKey: key });

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: finalMessages,
      stream: true,
      temperature: 0.8, // a little warmth/variation for a human feel
      top_p: 0.95,
      max_tokens: 900,
      presence_penalty: 0.3, // discourage repetitive phrasing across a long chat
      frequency_penalty: 0.2,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const token = chunk.choices?.[0]?.delta?.content;
            if (token) controller.enqueue(encoder.encode(token));
          }
        } catch (err) {
          controller.enqueue(
            encoder.encode("\n\n[stream interrupted — please try again]")
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const message =
      err?.error?.message || err?.message || "Unexpected server error.";
    const status = err?.status || 500;
    return Response.json({ error: message }, { status });
  }
}
