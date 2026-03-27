# Pokopedia Tracker — Project Context

## What is this

A Dockerized web tracker for **Pokémon Pokopia** (Nintendo Switch 2, released 2026-03-05). Pokopia is a life-simulation game where you play as a Ditto and build habitats on an island to attract Pokémon — no battles, no evolutions.

This app lets the user track:
- Which Pokémon they have registered in their Pokédex (caught)
- Which habitats they have built and which Pokémon they've attracted to each one
- Which zone each Pokémon lives in (6 game zones)
- Cross-navigation between Pokémon and their habitats
- In-game TODO list (free-text checklist)

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
- `app/seed/habitats_data.py` — All 209 habitats fully documented and seeded
- `app/seed/seeder.py` — Seeds DB on startup if empty
- No auth. Backend is read-only static data API.

### Frontend
- `src/pages/Pokedex.tsx` — Main Pokédex grid with search, type filter, status filter; reads `?search` URL param on load; fetches habitats for cross-nav; shows empty state when no results match. Includes `StatsRing` SVG circular progress component (defined inline) and a stats panel: caught/specials★/zoned.
- `src/pages/Habitatdex.tsx` — Habitat grid with category/status filters, expandable Pokémon list; reads `?search` URL param on load; shows empty state when no results match
- `src/pages/ZoneDashboard.tsx` — Zone view: summary bar (caught/assigned/unassigned), per-zone specialty coverage, Pokémon sprite grid; name labels at `text-[10px]`
- `src/pages/TodoPage.tsx` — Free-text checklist at `/todo`; stored in `useTodoStore` (localStorage persist); input capped at 200 chars; add via button or Enter; delete per item; "clear completed" footer action
- `src/components/PokemonCard.tsx` — Card with hover quick actions (CheckCircle2/Check icons) + detail modal; shows habitats list with navigation links; specialties shown as teal badges directly on card grid; accepts `habitats` prop
- `src/components/HabitatCard.tsx` — Card with category emoji, progress bar, expandable Pokémon grid; expand button shows Pokémon count (e.g. "3 ▾"); each Pokémon has a link to Pokédex search
- `src/components/PokemonSprite.tsx` — PNG sprite via `img.pokemondb.net` (normalized name inline); `<img>` tag replacing the old `<video>` WebM
- `src/components/TypeBadge.tsx` — Uses `t("types.${type}", type)` for translated type names; all 18 types in `en.json`/`es.json`
- `src/components/Navbar.tsx` — Sticky nav; desktop: horizontal links (Pokédex/Habitatdex/Zones/Todo) + icon buttons; mobile: hamburger (Menu/X) dropdown with all links and export/import; closes on route change
- `src/store/index.ts` — Zustand: `useProgressStore` (localStorage persist), `useUIStore`, `useTodoStore` (localStorage persist, key `pokopedia-todos`)
- `src/services/api.ts` — Axios wrapper for `getAllPokemon`, `getAllHabitats`, `getSpriteUrl()`
- Sprite URL pattern: `https://img.pokemondb.net/sprites/home/normal/{normalized_name}.png`

### Styling
- Font: **Press Start 2P** (pixel headers) + **Nunito** (body)
- Dark/light mode via Tailwind `darkMode: "class"`
- Brand color: red (`brand-500 = #ff3333`)
- Accent: teal, yellow, purple

## Current state (2026-03-27)

### Working
- Docker Compose builds and runs (backend + frontend + postgres)
- DB seeded automatically on first run (300 Pokémon, 7 NPCs, 209 habitats)
- Pokédex grid renders with search, filters, type filter; reads `?search` URL param on load
- Habitatdex grid with category/status filters; reads `?search` URL param on load
- Dark/light mode toggle
- EN/ES language toggle (full translation including specialty names, zone names, and Pokémon types)
- Pokémon types translated to Spanish via i18n: `TypeBadge.tsx` uses `t("types.${type}", type)`; all 18 types in `es.json`
- Progress stored in localStorage (no auth, no accounts)
- Export/Import progress as JSON via Navbar buttons (desktop icon buttons + mobile dropdown)
- Specialties shown as teal badges directly on Pokémon cards (and in detail modal), translated via i18n
- Sprites loading via `img.pokemondb.net` PNG; normalization done inline in `PokemonSprite.tsx`
- Cross-navigation: Pokémon modal lists habitats with links to Habitatdex; HabitatCard Pokémon entries link to Pokédex search
- Zone Dashboard at `/zones`: summary bar (caught/assigned/unassigned), per-zone specialty coverage, Pokémon sprite grid
- HabitatCard shows category emoji in header; expand button shows Pokémon count (e.g. "3 ▾")
- Empty state message when no results match filters (both Pokédex and Habitatdex)
- PokemonCard hover action uses CheckCircle2/Check icons
- Spanish zone names correct: Pradera Paleta, Estepa Estéril, Bahía Borrasca, Riscos Rocosos, Islas Aisladas, Isla Nube; `ZONE_LABELS` in `types/index.ts` is the source of truth
- Todo page at `/todo`: free-text checklist, localStorage persisted, 200-char cap per item
- Hamburger menu on mobile: dropdown with all nav links and export/import, closes on route change
- **Simplified specials** — legendary, mythical, and NPC all render as ★ only (no text label distinction); Pokédex filter collapses legendary + mythical into a single "Specials / Especiales" button; NPCs have a separate "NPCs" filter
- **Visual stats panel** — SVG circular progress ring (brand red, animated) showing caught%; 3 stat blocks alongside: Caught (X/300), Specials ★ (X/Y in yellow), Zoned (X/caught in teal); 2-col on mobile, 3-col on desktop

### Known issues / TODO

1. ~~**Remove auth entirely — go fully offline**~~ DONE (2026-03-25)

2. ~~**Sprites not loading (WebM/CORS)**~~ DONE (2026-03-25) — switched from Wikidex WebM to `img.pokemondb.net` PNG.
   Partial issue: sprites fail to load in normal browser sessions (cache serving old WebM URLs) but work in incognito. Likely a browser hard-cache issue; clearing browser cache (not just cookies) resolves it.

3. ~~**"Seen" status makes no sense for Pokopia**~~ DONE (2026-03-25) — only caught/uncaught now.

4. ~~**Cross-navigation Pokémon <-> Habitat**~~ DONE (2026-03-27)

5. **UI/UX redesign pending** — specific user feedback: layout distribution feels unpolished (retro font OK, rest not); wants charts and visual elements for quick data glance; remove mythical/legendary visual distinction; ensure desktop layout is addressed (not just mobile).

6. ~~**Specialties not shown in Pokémon card modal**~~ DONE (2026-03-25)

7. ~~**Zone dashboard missing**~~ DONE (2026-03-27)

8. **Event Pokémon missing** — need to identify which event Pokémon exist in Pokopia and add to seed data.

9. ~~**Habitatdex incomplete**~~ DONE (2026-03-27) — all 209 habitats seeded. Spanish names and Pokémon assignments still need verification against vandal.elespanol.com.

10. **Local images strategy** — user wants `/imgs/pokedex` and `/imgs/habitatdex` folders inside `frontend/public/` to serve images locally instead of from external APIs. Strategy: place files there and update `PokemonSprite.tsx` + `HabitatCard.tsx` to load from local paths, falling back to external if missing. User needs to populate the folders manually.

11. ~~**Spanish zone names wrong**~~ DONE (2026-03-27)

12. ~~**Specialty labels not translated**~~ DONE (2026-03-27) — `specialties` section in `en.json`/`es.json`. Spanish names may still be wrong; need verification.

13. ~~**Todo page missing**~~ DONE (2026-03-27) — `/todo` route with free-text checklist, localStorage persisted, XSS-safe (React renders as text, no `dangerouslySetInnerHTML`).

14. ~~**Hamburger menu**~~ DONE (2026-03-27) — mobile nav dropdown with Menu/X toggle.

15. **Spanish specialty names need verification** — current translations in `es.json` under `specialties` key may be inaccurate. Verify against pokexperto.net (specialidades page).

16. **Spanish habitat names and Pokémon assignments need verification** — verify against vandal.elespanol.com guide.

17. ~~**Pokémon types not translated**~~ DONE (2026-03-27) — all 18 types have `types.*` keys in `en.json`/`es.json`; `TypeBadge` and type filter buttons use `t("types.X")`.

18. ~~**Legendary/mythical/NPC text labels cluttered**~~ DONE (2026-03-27) — all specials now show ★ only; filter collapses legendary + mythical into "Specials / Especiales".

19. ~~**Stats panel lacked visual polish**~~ DONE (2026-03-27) — SVG circular progress ring + 3 stat blocks (caught, specials, zoned) replace the old plain progress bar.

## Game data notes

- **Zones (6):** Palette Town, Withered Wastelands, Bleak Beach, Rocky Ridges, Sparkling Skylands, Cloud Island
- **Specialties:** Appraise, Build, Bulldoze, Burn, Chop, Collect, Crush, DJ, Dream Island, Engineer, Explode, Fly, Gather, Gather Honey, Generate, Grow, Hype, Litter, Paint, Party, Rarify, Recycle, Search, Storage, Teleport, Trade, Transform, Water, Yawn
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
- `noUnusedLocals` and `noUnusedParameters` are set to `false` in tsconfig to avoid noise during development.
- Sprite normalization is done inline in `PokemonSprite.tsx`: lowercase, spaces/dots/apostrophes to hyphens, ♀ to `-f`, ♂ to `-m`, collapse double hyphens (e.g. `nidoran-f`, `mr-mime`).
- TodoPage input is rendered as plain text via React state; no `dangerouslySetInnerHTML`. XSS not possible.
- `StatsRing` is a local SVG component defined inside `Pokedex.tsx` (not extracted) — keep it there unless reuse is needed.
