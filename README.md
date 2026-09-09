# PadPair

Nigerian housing and roommate-matching platform — React + Vite frontend, no backend yet. All data (listings, roommates, messages, saved items, accounts) lives in the browser's localStorage and resets if you clear site data.

## Running it

```
npm install
npm run dev
```

## Structure

```
src/
├── main.jsx, App.jsx, index.css   entry point, routes, global styles
├── pages/          one file per screen (Discover, Profile, ListingDetail, ...)
├── components/     reusable pieces used across pages (Navbar, Icon, ListingCard, ...)
├── context/        shared app state (auth, listings, roommates, messages, theme, toasts)
└── utils/          plain helper logic — no React (compatibility scoring, scam-risk
                     heuristic, seed data, localStorage wrapper)
```

Nothing here talks to a server. `context/` holds everything in memory and mirrors it
to localStorage; `utils/seedData.js` is the starting dataset. Search the codebase for
`// NOTE:` and `// TODO:` comments for where a real backend would plug in later.
