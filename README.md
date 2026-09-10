# CakeLab

A mobile-first baking companion for home bakers — browse recipes, get help
from an AI baking assistant, convert units on the fly, and time your bakes,
all wrapped in a warm, minimalist cream-and-brown interface.

Built with **React**, **Tailwind CSS**, and **Claude**.

## Features

- 🎂 **45+ recipes** across cakes, cookies, bread, pastries, and desserts, with
  ingredient amounts that scale live as you adjust servings
- 🔍 **Search & filter** recipes by name, ingredient, or category
- 🤖 **AI Baking Assistant** — ask baking questions, troubleshoot mistakes,
  get ingredient substitutions, or find a recipe based on what's in your kitchen
- 📏 **Unit converter** — grams, cups, ml, oz, tbsp, and tsp, with real
  ingredient-density conversions (not just 1:1 guesses)
- ⏱️ **Baking timer** with presets and custom durations
- ❤️ **Favorites** saved locally, no account required
- 🌗 **Light & dark mode**
- 📱 Fully responsive — bottom nav on mobile, sidebar on desktop

## Screenshots

_Add a screenshot or two here once it's deployed — GitHub renders images
dropped straight into this README._

---

## Run it locally

```bash
npm install
npm run dev
```

Then open the URL it prints (usually http://localhost:5173).

## AI Assistant setup (optional)

The AI Baking Assistant needs an Anthropic API key to actually respond.

1. Get a key at https://console.anthropic.com/settings/keys
2. Copy `.env.example` to `.env`
3. Paste your key in: `VITE_ANTHROPIC_API_KEY=sk-ant-...`
4. Restart `npm run dev`

**Security note:** this wires the key directly into the browser bundle, so
anyone using dev tools could read it. That's okay for testing on your own
machine, but **do not deploy this publicly as-is**. For a real deployment,
move the `fetch` call in `src/App.jsx` (search for `send(`) to a small
backend or serverless function (e.g. a Vercel API route) that holds the key
server-side, and call that endpoint from the app instead.

Without a key, every other part of the app (recipes, favorites, converter,
timer, light/dark mode) works fully — only the chat responses are disabled,
and it'll tell the user how to fix that.

## Recreating it online (fastest options)

- **StackBlitz** (stackblitz.com) or **CodeSandbox** (codesandbox.io) — start
  a new Vite + React project, then drag these files in (or import this repo
  from GitHub). You get a shareable public URL immediately.
- **Vercel** or **Netlify** — push this folder to a GitHub repo, connect it,
  and it deploys automatically on every push, with a stable public URL and
  free custom domain support. This is the better choice if you want the app
  to stick around long-term or eventually wrap it for app stores.

## Data storage

Favorites, theme, and profile are saved in the browser's `localStorage` —
per-device only, no account needed. Swap `storageGet`/`storageSet` near the
top of `src/App.jsx` for real Supabase calls if you want accounts and
cross-device sync.

## Project structure

```
cakelab-project/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
└── src/
    ├── main.jsx      # React entry point
    ├── index.css     # Tailwind imports
    └── App.jsx       # The entire app (components, data, pages)
```
