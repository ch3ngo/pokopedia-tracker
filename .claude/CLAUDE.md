# Pokopedia Tracker — Project Context

## What is this

A Dockerized web tracker for **Pokémon Pokopia** (Nintendo Switch 2, released 2026-03-05). Pokopia is a life-simulation game where you play as a Ditto and build habitats on an island to attract Pokémon — no battles, no evolutions.

This app lets the user track:
- Which Pokémon they have registered in their Pokédex (caught)
- Which habitats they have built and which Pokémon they've attracted to each one
- Which zone each Pokémon lives in (5 game zones; Cloud Island removed)
- Cross-navigation between Pokémon and their habitats
- In-game TODO list (free-text checklist)
- Daily reminders (auto-reset each day at 5am; before 5am still counts as the previous day)
- Zone comfort level (1-10) per zone

## Architecture

```
docker-compose.yml
├── backend/        FastAPI + PostgreSQL + SQLAlchemy (async)
└── frontend/       React 18 + TypeScript + Vite + Tailwind CSS
```

### Backend
- `app/main.py` — FastAPI app, lifespan seeds DB on first start
- `app/models/` — SQLAlchemy models: `Pokemon`, `Habitat` (User/Progress models unused, left in place)
- `app/routers/` — `/api/pokemon`, `/api/habitats` (auth and progress routers removed)
- `app/seed/pokemon_data.py` — All 300 Pokopia Pokédex entries + 7 special NPC variants (IDs 301-307)
- `app/seed/habitats_data.py` — All 209 habitats fully documented and seeded; "Lovely Ribbon Cake" fixed to `specialized` category
- `app/seed/seeder.py` — Seeds DB on startup if empty
- No auth. Backend is read-only static data API.

### Frontend
- `src/pages/HomePage.tsx` — Home landing page at `/`. Daily reminders (stamp/mosslax/plants/dreamIsland, auto-reset at midnight via `useDailyStore`); Pokédex and Habitatdex progress cards with StatsRing; zone distribution mini-bars; todo preview (first 5 pending + count badge).
- `src/pages/Pokedex.tsx` — Main Pokédex grid at `/pokedex`. On `lg+`: fixed 240px left sidebar (sticky) with StatsRing + stat rows, status filters (vertical list), type filters (vertical scrollable list). Mobile: stats card (horizontal ring + stat blocks) + filter chips above search. Reads `?search` URL param on load; shows empty state when no results match.
- `src/pages/Habitatdex.tsx` — Habitat grid at `/habitats`. Same desktop sidebar pattern as Pokédex: sidebar with built/complete/total stats + status filters + category filters. Grid adjusts to `lg:2col xl:3col`. Mobile unchanged. Reads `?search` URL param on load; shows empty state when no results match.
- `src/pages/ZoneDashboard.tsx` — Zone view at `/zones`: summary bar (caught/assigned/unassigned); per-zone cards with comfort level tracker (10 clickable segments, color-coded red-to-emerald, persisted in `pokopedia-zones`); specialty coverage bar (teal, % label); Pokémon sprite grid (sprites are clickable buttons that open `PokemonDetailModal` inline with full caught/zone/notes/habitats editing); horizontal bar chart of Pokémon count per zone in summary section. Fetches `allHabitats` to pass to modal.
- `src/pages/TodoPage.tsx` — Free-text checklist at `/todo`; stored in `useTodoStore` (localStorage persist); input capped at 200 chars; add via button or Enter; delete per item; "clear completed" footer action; Spanish label "Tareas".
- `src/components/PokemonCard.tsx` — Card with hover quick actions (CheckCircle2/Check icons); delegates detail modal to `PokemonDetailModal`; specialties shown as teal badges directly on card grid; accepts `habitats` prop.
- `src/components/PokemonDetailModal.tsx` — Standalone modal with full Pokémon detail: sprite, types, specialties (teal badges), habitat links (navigate to Habitatdex), caught toggle, zone selector, notes. Accepts `onClose` callback. Used by both `PokemonCard` (Pokédex) and `ZoneDashboard` (Zones view).
- `src/components/HabitatCard.tsx` — Card with local image (`HabitatImage` subcomponent loads `/imgs/habitatdex/NNN.png`, falls back to category emoji placeholder); progress bar; expandable Pokémon grid; Pokémon count expand button; each Pokémon links to Pokédex search; caught sync: Pokémon counted as attracted if explicitly marked OR caught in Pokédex (`effectiveAttracted` logic reads `useProgressStore`)
- `src/components/StatsRing.tsx` — Reusable SVG circular progress ring (brand red, animated); accepts `value` and `max` props; used by Pokedex, Habitatdex, and HomePage
- `src/components/PokemonSprite.tsx` — PNG sprite via `img.pokemondb.net` (normalized name inline); `<img>` tag replacing the old `<video>` WebM
- `src/components/TypeBadge.tsx` — Uses `t("types.${type}", type)` for translated type names; all 18 types in `en.json`/`es.json`
- `src/components/Navbar.tsx` — Sticky top bar (hamburger icon + "Pokopedia" pixel title); opens a sidebar drawer overlay with nav links (Home/Pokédex/Habitatdex/Zones/Todo), lang/theme toggle buttons, and export/import buttons; closes on route change or backdrop click; no separate desktop/mobile layout
- `src/store/index.ts` — Zustand stores: `useProgressStore` (key `pokopedia-progress`), `useTodoStore` (key `pokopedia-todos`), `useZoneStore` (key `pokopedia-zones`, comfort levels), `useDailyStore` (key `pokopedia-daily`, daily reminders with date-based auto-reset), `useUIStore` (key `pokopedia-ui`, theme)
- `src/services/api.ts` — Axios wrapper for `getAllPokemon`, `getAllHabitats`, `getSpriteUrl()`
- `src/types/index.ts` — `Zone` type has 5 values (Cloud Island removed): `palette_town`, `withered_wastelands`, `bleak_beach`, `rocky_ridges`, `sparkling_skylands`
- Sprite URL pattern: `https://img.pokemondb.net/sprites/home/normal/{normalized_name}.png`

### Styling
- Font: **Press Start 2P** (pixel headers) + **Nunito** (body)
- Dark/light mode via Tailwind `darkMode: "class"`
- Brand color: red (`brand-500 = #ff3333`)
- Accent: teal, yellow, purple

## Current state (2026-03-28)

### Working
- Docker Compose builds and runs (backend + frontend + postgres)
- DB seeded automatically on first run (300 Pokémon, 7 NPCs, 209 habitats)
- Pokédex grid renders with search, filters, type filter; reads `?search` URL param on load
- Habitatdex grid with category/status filters; reads `?search` URL param on load
- Dark/light mode toggle
- EN/ES language toggle (full translation including specialty names, zone names, and Pokémon types)
- Pokémon types translated to Spanish via i18n: `TypeBadge.tsx` uses `t("types.${type}", type)`; all 18 types in `es.json`
- Progress stored in localStorage (no auth, no accounts)
- Export/Import progress as JSON via sidebar drawer buttons
- Specialties shown as teal badges directly on Pokémon cards (and in detail modal), translated via i18n
- Sprites loading via `img.pokemondb.net` PNG; normalization done inline in `PokemonSprite.tsx`
- Cross-navigation: Pokémon modal lists habitats with links to Habitatdex; HabitatCard Pokémon entries link to Pokédex search
- Zone Dashboard at `/zones`: comfort level tracker (10 segments/zone, color-coded), specialty coverage bar, clickable Pokémon sprites open full detail modal (caught/zone/notes/habitats), horizontal Pokémon count bars in summary
- HabitatCard: local image loading (`/imgs/habitatdex/NNN.png`) with emoji category fallback; image files must be placed manually by user
- HabitatCard caught sync: Pokémon counts as attracted if caught in Pokédex (reads `useProgressStore` directly, no manual marking needed)
- Empty state message when no results match filters (both Pokédex and Habitatdex)
- PokemonCard hover action uses CheckCircle2/Check icons
- Spanish zone names correct: Pradera Paleta, Estepa Estéril, Bahía Borrasca, Riscos Rocosos, Islas Aisladas; `ZONE_LABELS` in `types/index.ts` is the source of truth; Cloud Island removed (5 zones total)
- Todo page at `/todo`: free-text checklist, localStorage persisted, 200-char cap per item; Spanish label "Tareas"
- Sidebar drawer nav (all screen sizes): hamburger opens drawer with all nav links (including Home), lang/theme toggles, export/import; closes on route change or backdrop click
- **Simplified specials** — legendary, mythical, and NPC all render as ★ only (no text label distinction); Pokédex filter collapses legendary + mythical into a single "Specials / Especiales" button; NPCs have a separate "NPCs" filter
- **Visual stats panel** — `StatsRing` component (brand red SVG ring, animated) on Pokédex, Habitatdex, and HomePage; Pokédex: Caught (X/300), Specials ★ (X/Y), Zoned (X/caught); Habitatdex: Built (X/209), Complete (X/209), Total (209)
- **Desktop sidebar layout** — Pokédex and Habitatdex have a fixed 240px sticky sidebar on `lg+` screens with stats ring, status filters, and type/category filters as vertical lists; mobile layout unchanged (chips + horizontal stats card)
- **Home page** at `/` — daily reminders (stamp/mosslax/plants/dreamIsland, auto-reset at 5am), progress cards for Pokédex/Habitatdex with StatsRing, zone distribution bars, pending todo preview
- **Zone comfort tracker** — 10 clickable color-coded segments per zone; persisted in `pokopedia-zones` localStorage store
- **Zone Pokémon modal** — sprites in ZoneDashboard are clickable buttons that open `PokemonDetailModal` inline (full caught/zone/notes editing + habitat links); no longer navigates away to Pokédex
- **PokemonDetailModal extracted** — standalone component used by Pokédex and Zone Dashboard; `PokemonCard` delegates to it instead of duplicating JSX
- **Lovely Ribbon Cake** fixed to `specialized` category in seed data (requires DB reset to apply)
- i18n keys `common.status`, `common.type`, `common.category` added to `en.json`/`es.json`

### Known issues / TODO

1. ~~**Remove auth entirely — go fully offline**~~ DONE (2026-03-25)

2. ~~**Sprites not loading (WebM/CORS)**~~ DONE (2026-03-25) — switched from Wikidex WebM to `img.pokemondb.net` PNG.
   Partial issue: sprites fail to load in normal browser sessions (cache serving old WebM URLs) but work in incognito. Likely a browser hard-cache issue; clearing browser cache (not just cookies) resolves it.

3. ~~**"Seen" status makes no sense for Pokopia**~~ DONE (2026-03-25) — only caught/uncaught now.

4. ~~**Cross-navigation Pokémon <-> Habitat**~~ DONE (2026-03-27)

5. ~~**UI/UX improvements**~~ DONE (2026-03-28) — desktop sidebar, home page, zone enhancements all complete.

6. ~~**Specialties not shown in Pokémon card modal**~~ DONE (2026-03-25)

7. ~~**Zone dashboard missing**~~ DONE (2026-03-27)

8. **Event Pokémon missing** — need to identify which event Pokémon exist in Pokopia and add to seed data.

9. ~~**Habitatdex incomplete**~~ DONE (2026-03-27) — all 209 habitats seeded. Spanish names and Pokémon assignments still need verification against vandal.elespanol.com.

10. **Local images strategy (partial)** — HabitatCard already loads `/imgs/habitatdex/NNN.png` with emoji fallback (DONE 2026-03-28). Pokédex sprites still use external `img.pokemondb.net`. To switch sprites to local: add files to `frontend/public/imgs/pokedex/` and update `PokemonSprite.tsx` to try local path first, fall back to external if 404. User must populate image folders manually.

11. ~~**Spanish zone names wrong**~~ DONE (2026-03-27)

12. ~~**Specialty labels not translated**~~ DONE (2026-03-27)

13. ~~**Todo page missing**~~ DONE (2026-03-27)

14. ~~**Hamburger menu**~~ DONE (2026-03-27/2026-03-28) — redesigned as sidebar drawer; all links, lang/theme, export/import in one drawer.

15. **Spanish specialty names need verification** — current translations in `es.json` under `specialties` key may be inaccurate. Verify against pokexperto.net (specialidades page).

16. **Spanish habitat names and Pokémon assignments need verification** — verify against vandal.elespanol.com guide.

17. ~~**Pokémon types not translated**~~ DONE (2026-03-27)

18. ~~**Legendary/mythical/NPC text labels cluttered**~~ DONE (2026-03-27)

19. ~~**Stats panel lacked visual polish**~~ DONE (2026-03-27/2026-03-28) — `StatsRing` in use across all main pages.

20. ~~**Desktop layout unaddressed**~~ DONE (2026-03-28)

21. ~~**Home landing page missing**~~ DONE (2026-03-28) — `HomePage.tsx` at `/` with daily reminders, progress cards, zone bars, todo preview.

22. ~~**Zone Dashboard: comfort level tracker missing**~~ DONE (2026-03-28) — 10-segment color-coded tracker per zone, persisted in localStorage.

23. ~~**Zone Dashboard: richer charts needed**~~ DONE (2026-03-28) — specialty coverage bar, Pokémon count bars, clickable sprites.

24. ~~**Habitat data fix: "Lovely Ribbon Cake" category wrong**~~ DONE (2026-03-28) — fixed to `specialized` in seed data. Requires `docker compose down -v && docker compose up --build` to apply.

25. ~~**Todo page: "Lista" label should be "Tareas" in Spanish**~~ DONE (2026-03-28) — `nav.todo` i18n key updated.

26. ~~**Cloud Island zone: needs removal**~~ DONE (2026-03-28) — removed from `Zone` type, `ZONES`, `ZONE_LABELS`, `ZONE_EMOJI`, and both i18n files. Now 5 zones.

27. ~~**Zone Dashboard: Pokémon sprites open full detail modal**~~ DONE (2026-03-28) — `PokemonDetailModal` extracted as standalone component; ZoneDashboard renders it on sprite click with full caught/zone/notes/habitats functionality. No longer navigates away.

## Game data notes

- **Zones (5):** Palette Town, Withered Wastelands, Bleak Beach, Rocky Ridges, Sparkling Skylands (Cloud Island removed)
- **Specialties:** Appraise, Build, Bulldoze, Burn, Chop, Collect, Crush, DJ, Dream Island, Eat, Engineer, Explode, Fly, Gather, Gather Honey, Generate, Grow, Hype, Illuminate, Litter, Paint, Party, Rarify, Recycle, Search, Storage, Teleport, Trade, Transform, Water, Yawn
- **Habitatdex:** 209 total, all documented in seed data as of 2026-03-27. Spanish names/assignments need external verification.
- **Event Pokémon:** not yet added. Need to identify which event Pokémon exist in Pokopia.
- **Special NPCs (IDs 301-307):** Professor Tangrowth, Peakychu, Mosslax, Smearguru, DJ Rotom, Chef Dente, Tinkmaster. Unique variants, not catchable in the normal sense.

## How to run

```bash
cp .env.example .env
# Edit .env — set DB_PASSWORD
docker compose up --build
# Frontend: http://localhost:3000
# API docs: http://localhost:8000/docs
```

To reset the database (e.g. after model changes):
```bash
docker compose down -v
docker compose up --build
```

## Dev notes

- Backend uses SQLAlchemy async with asyncpg. All DB operations must be `await`ed.
- Habitat `pokemon_ids` is `ARRAY(Integer)` — was `ARRAY(String)` and caused a seeder crash (fixed 2026-03-25).
- Progress store uses Zustand `persist` middleware writing to `localStorage` key `pokopedia-progress`.
- Todo store uses Zustand `persist` writing to `localStorage` key `pokopedia-todos`.
- Zone comfort store: `pokopedia-zones`; daily reminders store: `pokopedia-daily` (auto-resets when date changes via `resetIfNewDay()` called on HomePage mount; before 5am counts as previous day, so reset fires at 5:00am not midnight).
- `noUnusedLocals` and `noUnusedParameters` are set to `false` in tsconfig to avoid noise during development.
- Sprite normalization is done inline in `PokemonSprite.tsx`: lowercase, spaces/dots/apostrophes to hyphens, ♀ to `-f`, ♂ to `-m`, collapse double hyphens (e.g. `nidoran-f`, `mr-mime`).
- TodoPage input is rendered as plain text via React state; no `dangerouslySetInnerHTML`. XSS not possible.
- `StatsRing` is a standalone component at `src/components/StatsRing.tsx`; accepts `value` and `max`; imported by Pokedex, Habitatdex, and HomePage.
- Habitat local images: `HabitatImage` subcomponent inside `HabitatCard.tsx` loads `/imgs/habitatdex/{id:03d}.png` and falls back to the category emoji div on `onError`. Place image files in `frontend/public/imgs/habitatdex/` (zero-padded 3-digit filenames, e.g. `001.png`).
- Pokédex route changed from `/` to `/pokedex`; home is now `HomePage.tsx` at `/`.
- "Lovely Ribbon Cake" fix in `habitats_data.py` requires a DB reset (`docker compose down -v`) to take effect since the seeder only runs on an empty DB.
- `PokemonDetailModal` is a standalone component at `src/components/PokemonDetailModal.tsx`; accepts `pokemon`, `habitats`, `onClose` props; manages no router state of its own.
- `ZoneDashboard` fetches both `allPokemon` and `allHabitats` to support the inline `PokemonDetailModal`.
