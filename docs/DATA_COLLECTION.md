# 📚 Data Collection & Preparation

How the persona data for **Hitesh Choudhary** and **Piyush Garg** was gathered
from publicly available sources and turned into a usable "style fingerprint".

> **Ethics note.** Only public content was used. No private data, no scraping of
> gated material. The app is clearly labelled as an **AI recreation for
> educational purposes, not affiliated with** either person, and no content is
> reproduced verbatim — we model *style*, not copyrighted text.

---

## 1. Sources used

### Hitesh Choudhary
- **Personal site:** https://hitesh.ai/ (redirects to hiteshchoudhary.com)
- **YouTube:** "Chai aur Code" — https://www.youtube.com/@chaiaurcode
- **Docs/courses:** chaicode.com, docs.chaicode.com
- **LinkedIn / public bio:** career history and how he describes himself
- **Public interviews & community posts** discussing his teaching philosophy

### Piyush Garg
- **Personal site:** https://www.piyushgarg.dev/ (bio, products, courses, cohorts)
- **YouTube:** https://www.youtube.com/@piyushgargdev
- **Course pages:** Udemy (Node.js, Docker, DSA, Full-Stack GenAI), pro.piyushgarg.dev
- **Products:** Teachyst (LMS), plus his public "I build devs, not just apps" tagline
- **Interviews** (e.g. "From Coding to Teaching Thousands")

---

## 2. What we extracted (the "style fingerprint")

For each person we captured five dimensions:

| Dimension | Hitesh Choudhary | Piyush Garg |
|---|---|---|
| **Language mix** | Warm **Hinglish**, Hindi connective tissue + English tech terms | Mostly English with casual Hinglish sprinkles |
| **Catchphrases** | "Haanji", "dekhiye", "chaliye", "maza aa jayega", chai metaphors, "aap" | "so basically", "let's actually build this", "in production", "dekho", "the point is" |
| **Tone** | Calm, patient, encouraging, mentor-like, playful | Direct, energetic, pragmatic, time-respecting |
| **Teaching approach** | Intuition → analogy → thorough step-by-step, project-based | Project-first, production-focused, architecture + "why", ship it |
| **Background facts** | Chai aur Code / ChaiCode founder, ex-LCO, ex-CTO iNeuron, ex-Sr Director PW, NIT Jaipur, CS50, security, 39+ countries | 5+ yrs SWE, full-stack, Teachyst founder, MERN/Docker/AWS/GenAI, cohorts, 325k+ subs |

---

## 3. Preparation pipeline

1. **Collect** — read/skim each source; note recurring phrases, sentence rhythm,
   the emotional register, and the way each explains a hard concept.
2. **Distil** — compress observations into a compact, structured description of
   voice + teaching method (no copyrighted text copied).
3. **Encode** — write this into a **system prompt** per persona in
   `lib/personas.js`, plus **1–2 few-shot example turns** written in-character to
   demonstrate the target tone (in-context learning).
4. **Add UI metadata** — greeting, tagline, accent color, initials, and starter
   suggestion prompts, all consistent with the persona.
5. **Iterate** — test conversations, spot "AI-assistant" leakage or over-use of a
   catchphrase, and refine the prompt wording and guardrails.

---

## 4. Why prompt-based (vs fine-tuning)

For this scope, **prompt engineering + few-shot** is the right tool:

- **No training data licensing issues** — we describe style rather than train on
  copyrighted transcripts.
- **Instant iteration** — tweak a sentence, not a training run.
- **Transparent & auditable** — the entire persona lives in one readable file.
- **Portable** — swap the model with zero retraining.

A natural future upgrade is **RAG** over publicly available transcripts for
factual grounding (see the roadmap), which complements — not replaces — the
prompt-based voice modelling.
