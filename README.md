# ☕ Chai, Code & Personas

An AI-powered website that lets you **chat with an AI recreation of Hitesh
Choudhary or Piyush Garg**, mirroring each educator's voice, vocabulary, and
teaching style. Built with Next.js 14 + OpenAI, with streaming responses and
one-tap persona switching.

> ⚠️ This is an **AI recreation for educational purposes** and is **not
> affiliated with, endorsed by, or representing** Hitesh Choudhary or Piyush Garg.
> Personas were modelled from publicly available content to study communication
> style. No content is reproduced verbatim.

---

## ✨ Features

- 🎭 **Two authentic personas** — Hitesh Choudhary (warm Hinglish, "Haanji", chai
  metaphors) and Piyush Garg (direct, project-first, production-focused).
- 🔀 **One-tap switching** with **independent threads** per persona (no context bleed).
- ⚡ **Streaming responses** — tokens render live with a typing caret.
- 💬 **Rich formatting** — Markdown, code blocks with syntax styling, lists, links.
- 🧵 **Context management** — sliding window + summarized long-term memory.
- 🔐 **Secure** — the OpenAI key stays server-side, never exposed to the browser.
- 📱 **Responsive & themed** — clean UI that re-colors per persona; mobile-friendly.

---

## 🧱 Tech stack

Next.js 14 (App Router) · React 18 · Tailwind CSS · OpenAI `gpt-4o-mini`
(configurable) · react-markdown · deployed on Vercel.

---

## 📂 Project structure

```
persona-chat/
├─ app/
│  ├─ api/chat/route.js     # streaming OpenAI endpoint (server-side key)
│  ├─ layout.js             # root layout + metadata
│  ├─ page.js               # renders <ChatApp/>
│  └─ globals.css           # Tailwind + chat/Markdown styles
├─ components/
│  ├─ ChatApp.jsx           # state, streaming fetch, per-persona threads
│  ├─ PersonaSwitcher.jsx   # Hitesh ⇄ Piyush toggle
│  ├─ ChatMessage.jsx       # Markdown bubble + typing caret
│  ├─ ChatInput.jsx         # auto-growing input, send/stop
│  └─ Composer.jsx          # starter suggestion chips
├─ lib/
│  ├─ personas.js           # 🎭 persona voices, prompts, few-shot, UI metadata
│  └─ context.js            # 🧵 context window + memory management
├─ docs/                    # data collection, prompt eng, context mgmt, samples
├─ .env.example             # copy to .env.local and add your key
├─ ROADMAP.md               # full project roadmap
└─ README.md
```

---

## 🚀 Setup & run (local)

### Prerequisites
- **Node.js 18.17+** (or 20+)
- An **OpenAI API key** — https://platform.openai.com/api-keys

### Steps

```bash
# 1. Clone
git clone https://github.com/<your-username>/persona-chat.git
cd persona-chat

# 2. Install dependencies
npm install

# 3. Add your API key
cp .env.example .env.local
#   then open .env.local and set:
#   OPENAI_API_KEY=sk-...

# 4. Run the dev server
npm run dev

# 5. Open the app
#   http://localhost:3000
```

### Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | ✅ | — | Your OpenAI secret key |
| `OPENAI_MODEL` | ❌ | `gpt-4o-mini` | Any chat-completions model (e.g. `gpt-4o`) |

---

## 🏗️ Build & production

```bash
npm run build   # production build
npm run start   # serve the production build
```

---

## ☁️ Deploy to Vercel (recommended)

1. Push this repo to GitHub.
2. Go to **vercel.com → Add New → Project** and import the repo.
3. Framework preset auto-detects **Next.js** — no config needed.
4. Under **Environment Variables**, add:
   - `OPENAI_API_KEY = sk-...`
   - *(optional)* `OPENAI_MODEL = gpt-4o-mini`
5. Click **Deploy**. You'll get a live `https://<project>.vercel.app` URL.

> The `/api/chat` route runs on Vercel's Edge runtime, so the key is only ever
> read server-side.

---

## 🧭 How it works (30-second version)

1. You type a message; the client `POST`s the persona id + trimmed history to
   `/api/chat`.
2. The server builds the payload: **persona system prompt → memory summary →
   few-shot examples → recent turns** (`lib/context.js`).
3. It calls OpenAI with `stream: true` and pipes tokens back as they arrive.
4. The UI renders them live as Markdown, in that persona's colours.

See [`ROADMAP.md`](ROADMAP.md) and the [`docs/`](docs) folder for the full write-up
on data collection, prompt engineering, and context management.

---

## 🧩 Adding another persona

Append one object to `PERSONAS` in `lib/personas.js`
(`id, name, tagline, accent, accentSoft, initials, greeting, suggestions,
systemPrompt, fewShot`). The switcher, theming, and routing pick it up
automatically — no other file changes required.

---

## 📜 License & disclaimer

For educational/demonstration use. Not affiliated with Hitesh Choudhary or Piyush
Garg. Respect the source creators — go watch their real content and courses:
**[Chai aur Code](https://www.youtube.com/@chaiaurcode)** ·
**[Piyush Garg](https://www.youtube.com/@piyushgargdev)**.
