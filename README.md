# SkillSwap: Teach • Learn • Grow

> Everyone is a teacher. Everyone is a learner.

A free, peer-to-peer campus skill-exchange web app (React + Vite). No money changes hands.
Built as a first-year B.Tech CSE (AI) Tech Expo project.

## Run it in VS Code (5 minutes)

1. Install **Node.js 18 or newer** from https://nodejs.org (check with `node -v`).
2. Open this folder in VS Code: **File → Open Folder → skillswap**.
3. Open the terminal (**Ctrl + `**) and run:

```bash
npm install
npm run dev
```

4. Open the address it prints (usually **http://localhost:5173**).

Other commands:

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Create the production site in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the matching-engine unit tests (no install needed) |

## Demo script for the Expo (3 minutes)

1. **Home**: Ananya's Give & Ask score (12 helped / 8 asked). Asking counts too.
2. **Discover**: search `python`, open "Why this match?", save someone with the bookmark.
3. **Smart Matches → Chain Swaps**: Ananya has no direct match, but the graph finds
   Ananya → Rahul → Meera → Ananya. Click **View Details**, then **Request chain swap**.
4. **Group Sessions**: open *Video Editing – Beginner* (4 learners, Sat 2–4 PM). Click **Suggest Another Time**, then **Accept Session**.
5. **Sessions → Pending**: the request is *pending*, not confirmed. Use the top bar
   **Demo: viewing as** to switch to Rahul or Meera and accept as them (or press
   *Demo: simulate others accepting*).
6. Back as Ananya: **Mark as completed**, leave feedback, and watch the Give & Ask score update.
7. **Leaderboard** and **How it works** for the story (problem, algorithm, pilot plan).

## What is real and what is demo

Real (works in the code):
- Skill search with Teach/Learn, level and day filters
- Match score = **skill overlap × schedule overlap × level fit**, with the three numbers shown
- **Chain swaps** found by directed-cycle detection (DFS over the "can learn from" graph, 3–4 people)
- **Group sessions** triggered when 3 or more students want the same skill/level and a teacher shares a window
- Suggestion → Pending → Confirmed → Completed lifecycle; scores only change on completion
- Editable profile (skills to teach/learn, free time) that changes the matches instantly
- Messages, bookmarks, notifications, leaderboard
- State saved in the browser (`localStorage`)

Demo-only (be upfront about it at the Expo):
- 14 fictional students; avatars are initials, not photos
- No accounts or backend: everything lives in your browser. **"Demo: viewing as"** lets one person play any student
- Messages never reach another device and nobody replies automatically
- The original plan used Google Sheets + Pandas + NetworkX + Streamlit; this app uses the same algorithms in JavaScript

To reset the demo data, clear this site's storage in the browser (DevTools → Application → Local Storage → delete `skillswap-demo-v1`) and refresh.

## Project structure

```
skillswap/
├─ index.html              page shell + Inter font
├─ package.json            dependencies and scripts
├─ vite.config.js          Vite + React plugin
├─ public/favicon.svg
├─ src/
│  ├─ main.jsx             React entry
│  ├─ App.jsx              routes
│  ├─ styles.css           all styling (design tokens at the top)
│  ├─ data/seed.js         demo students, sessions, messages  ← edit to add your friends
│  ├─ lib/
│  │  ├─ matching.js       scoring, direct matches, chain cycles, group proposals, badges
│  │  ├─ store.jsx         app state, session lifecycle, localStorage
│  │  └─ router.js         tiny hash router (works on any static host)
│  ├─ components/          Layout, UI primitives, RequestModal
│  └─ pages/               Home, Discover, Matches, GroupProposal, Sessions,
│                          Feedback, Profile, Messages, Leaderboard, About
└─ tests/
   ├─ matching.test.mjs    unit tests for the algorithms (node:test)
   └─ smoke.jsx            server-renders every route + tests the session lifecycle
```

## Make it yours (pilot with real friends)

Edit `src/data/seed.js`: replace the fictional students with 15 to 20 real friends (skills, levels,
free slots). Day numbers are Mon=0 … Sun=6; hours use a 24-hour clock. The deck's pilot plan
(5 to 8 skills, about 20 profiles) fits this file directly.

## Deploy for free

**Netlify (easiest)**: run `npm run build`, then drag the `dist` folder onto https://app.netlify.com/drop.

**Vercel**: push to GitHub → import the repo at https://vercel.com → framework "Vite" → Deploy.

**GitHub Pages**: `npm run build`, then publish the `dist` folder (e.g. with the `gh-pages` package or a
Pages workflow). `base: "./"` in `vite.config.js` already makes asset paths relative.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `npm: command not found` | Install Node.js, then reopen VS Code |
| `npm install` fails or hangs | Check internet, then `npm cache clean --force` and retry |
| Port 5173 in use | Vite picks the next free port; use the URL it prints |
| Blank page after deploy | Make sure you deployed `dist/`, not the project root |
| Old data keeps showing | Clear the `skillswap-demo-v1` Local Storage key and refresh |
| Fonts look different offline | Inter loads from Google Fonts; the app falls back to system fonts |
