# PadPair

A sleek, dark-mode-first housing and roommate-matching platform for the Nigerian
rental market, built with React and Tailwind CSS. Tenants get matched with
compatible roommates by a real scoring algorithm, browse and filter listings
across five cities, and message landlords directly — while landlords run their
own listings through a full creation-to-inbox workflow, completely separate
from the tenant side.

## 🛠️ Technologies Used

* **React (ES6+):** Component-based UI architecture, the Context API for global
  app state (auth, listings, roommates, messages, theme, toasts), and
  declarative, state-driven rendering throughout.
* **React Router:** Client-side routing, plus custom route guards
  (`ProtectedRoute`, `RoleRoute`) that gate entire sections of the app behind
  login state and account type.
* **Tailwind CSS:** A fully custom design-token theme (colors, spacing, type
  scale) extracted from Figma-style mockups, with a toggleable light/dark
  mode driven by CSS variables rather than Tailwind's default palette.
* **JavaScript (ES6):** Immutable state updates via `map`/`filter`/spread,
  `FileReader` for client-side image-to-base64 conversion, and a small
  `localStorage` wrapper standing in for a real database.

## ✨ Features

**For tenants**
* A required compatibility questionnaire on signup (lifestyle habits, budget,
  move-in timeline) that a weighted scoring algorithm matches against every
  roommate profile
* Sidebar-filterable listings (city, price, property type, bedrooms,
  verified/furnished) with free-text search
* Roommate browsing ranked live by compatibility score
* A combined "My Interests" page for saved listings and saved roommates
* Direct messaging with landlords and roommates
* A scam-risk heuristic that flags listings with red-flag language or
  suspiciously low prices

**For landlords**
* A separate required onboarding questionnaire (phone, individual vs. agency,
  experience, property types managed)
* A 4-step listing wizard — property type → rent/amenities/description →
  photo upload → review — with drag-and-drop photo upload and an
  auto-generate-description helper
* A "My Listings" dashboard to view, edit, and delete their own properties
* A real inbox that receives messages from interested tenants

**Account system**
* Full signup/login with per-account credential checking and persistent
  sessions
* Tenant and landlord accounts are genuinely different apps under one roof —
  different onboarding, different navigation, different permissions

## 🛠️ Process & Development Story

I built PadPair by converting a set of static Stitch-generated HTML mockups
into a real, working React app — one screen at a time, then wiring the
screens together into an actual product. The first challenge was extracting a
consistent design system out of mockups that had drifted slightly between
screens (two different working names, two slightly different palettes), and
turning that into one real `tailwind.config.js` with semantic color tokens
backed by CSS variables, so light and dark mode could share the same class
names instead of duplicating markup.

The harder design problem was state. With no backend, every "server" concept
— accounts, listings, messages, saved items — had to live in `localStorage`
behind a Context API layer, which meant thinking carefully about what a real
backend would eventually own versus what could stay purely client-side. The
trickiest piece was messaging: I originally had one global pool of
conversations, which meant every account on the same browser saw the same
inbox. I rebuilt it so each account keeps its own mailbox, and sending a
message writes into *both* the sender's and the recipient's stored inbox at
once — a deliberate simulation of a real two-way system without a server
round-trip.

The other major piece of work was building real permission boundaries between
tenants and landlords: separate onboarding questionnaires, a route guard that
redirects each role away from the other's pages, and a listing-creation
wizard that only unlocks once a landlord has completed their profile.

## 💡 What I Learnt

* **Context API architecture:** How to split global state into focused
  providers (auth, listings, messages, etc.) instead of one giant store, and
  how provider *order* matters when one context needs to read from another
  (messaging needs to know who's logged in).
* **Route guards as components:** Building `ProtectedRoute` and `RoleRoute` as
  ordinary components that wrap `<Outlet />`, rather than reaching for a
  routing library feature — and the React hooks-ordering trap of putting a
  conditional `return` before all of a component's `useState` calls.
  
* **Simulating a backend honestly:** Where to draw the line between "fake it
  convincingly" (per-account message mirroring, versioned seed data that
  resets stale caches) and "just be upfront that it's missing" (plaintext
  passwords, no real-time sync) — and documenting that boundary clearly
  rather than hiding it.
* **Multi-step controlled forms:** Managing one large form object across a
  4-step wizard with per-step validation, versus splitting state per step.
* **Immutable array/object updates at scale:** Once state includes nested
  objects (a user's `lifestyle` object, a listing's `amenities` array), spread
  syntax alone isn't enough — needed consistent patterns for updating nested
  fields without mutating.

## 🚀 How to Run the Project

1. Clone the Repository:

```
git clone https://github.com/Rhodex15/padpair.git
```

2. Navigate to the Project Folder:

```
cd padpair
```

3. Install Dependencies:

```
npm install
```

4. Start the Development Server:

```
npm run dev
```

Open `http://localhost:5173` (or the port shown in your terminal) in your
browser. Sign up as either a tenant or a landlord to see the two different
flows — everything is stored in your browser's `localStorage`, so no backend
setup is required.

## 📸 Preview

<img width="1366" height="645" alt="Image" src="https://github.com/user-attachments/assets/cb8f7f59-069e-4dda-97fc-8bf06bdbfcc0" />

## Project Structure

```
src/
├── main.jsx, App.jsx, index.css   entry point, all routes, global styles
├── pages/          one file per screen (Discover, Profile, ListingDetail, ...)
├── components/     reusable UI pieces shared across pages (Navbar, Icon, ListingCard, ...)
├── context/        app-wide state — auth, listings, roommates, messages, theme, toasts
└── utils/          plain JS helpers with no React — compatibility scoring, the
                     scam-risk heuristic, seed data, the localStorage wrapper
```

## Architecture & Limitations

This is a **frontend-only prototype** — there is no server, so a few things
are simulated in ways worth knowing about:

* **Passwords are stored in plain text** in `localStorage`. Fine for a
  prototype running in your own browser, not acceptable for anything real.
* **Messaging simulates a two-way inbox** by writing each message directly
  into both the sender's and recipient's own `localStorage` entry
  (`messages:<userId>`) at send time — see `context/MessagesContext.jsx`.
  This only works because both accounts share a browser; it is not
  real-time and does not sync across devices.
* **Uploaded listing photos** are converted to base64 and stored inline in
  `localStorage`, capped at 5 photos / 1.5MB each to avoid hitting the
  browser's storage quota.
* **Compatibility scoring and scam-risk flagging** are simple weighted
  heuristics (`utils/compatibility.js`, `utils/scamDetection.js`), not AI —
  written as drop-in stand-ins for a future real API call.
* **Seed data is versioned.** `SEED_VERSION` in `utils/seedData.js` is
  checked against what's cached in your browser; bumping it resets the
  seeded listings (but preserves anything a signed-in landlord created).

### What's not built yet

* A real backend, database, and authentication (password hashing, sessions)
* Payments — deliberately out of scope; PadPair only connects tenants and
  landlords, it never handles money
* Real-time messaging, push notifications, email
* Server-side image hosting (photos are base64-in-localStorage for now)
