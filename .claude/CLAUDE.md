# Pokopedia Tracker — Project Context

## What is this

A Dockerized web tracker for **Pokémon Pokopia** (Nintendo Switch 2, released 2026-03-05). Pokopia is a life-simulation game where you play as a Ditto and build habitats on an island to attract Pokémon — no battles, no evolutions.

This app lets the user track:
- Which Pokémon they have registered in their Pokédex (caught)
- Which habitats they have built and which Pokémon they've attracted to each one
- Which zone each Pokémon lives in (6 game zones)
- Cross-navigation between Pokémon and their habitats

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
- `app/seed/habitats_data.py` — 100 documented habitats (Pokopia has 209 total; remainder pending game documentation)
- `app/seed/seeder.py` — Seeds DB on startup if empty
- No auth. Backend is read-only static data API.

### Frontend
- `src/pages/Pokedex.tsx` — Main Pokédex grid with search, type filter, status filter
- `src/pages/Habitatdex.tsx` — Habitat grid with category/status filters, expandable Pokémon list
- `src/components/PokemonCard.tsx` — Card with hover quick actions + detail modal
- `src/components/HabitatCard.tsx` — Card with progress bar and expandable Pokémon grid
- `src/components/PokemonSprite.tsx` — Animated WebM sprite via Wikidex `Especial:FilePath`
- `src/components/Navbar.tsx` — Nav with Download/Upload buttons for JSON export/import
- `src/store/index.ts` — Zustand: `useProgressStore` (localStorage persist), `useUIStore`
- `src/services/api.ts` — Axios wrapper for `getAllPokemon`, `getAllHabitats`, `getSpriteUrl()`
- Sprite URL pattern: `https://www.wikidex.net/wiki/Especial:FilePath/{spriteKey}_EP.webm`

### Styling
- Font: **Press Start 2P** (pixel headers) + **Nunito** (body)
- Dark/light mode via Tailwind `darkMode: "class"`
- Brand color: red (`brand-500 = #ff3333`)
- Accent: teal, yellow, purple

## Current state (2026-03-25)

### Working
- Docker Compose builds and runs (backend + frontend + postgres)
- DB seeded automatically on first run (300 Pokémon, 7 NPCs, 100 habitats)
- Pokédex grid renders with search, filters, type filter
- Habitatdex grid with category/status filters
- Dark/light mode toggle
- EN/ES language toggle
- Progress stored in localStorage (no auth, no accounts)
- Export/Import progress as JSON via Navbar buttons
- Specialties shown in Pokémon detail modal

### Known issues / TODO

1. ~~**Remove auth entirely — go fully offline**~~ DONE (2026-03-25)

2. **Sprites not loading**
   Wikidex WebM URLs require a browser that supports WebM and may have CORS issues. Sprites show the fallback `?` placeholder. Need to investigate: try direct CDN URLs, or proxy through backend, or use PokéAPI sprites as fallback.
   Also: **event Pokémon are missing** (not yet added to seed data).

3. ~~**"Seen" status makes no sense for Pokopia**~~ DONE (2026-03-25) — only caught/uncaught now.

4. **Cross-navigation Pokémon ↔ Habitat**
   In the Pokémon detail modal, show which habitats it can spawn in (with a link to the habitat).
   In the Habitat card/detail, clicking a Pokémon should open its detail modal.

5. **UI/UX problems**
   - Layout does not respect screen edges on small screens (padding issues)
   - General interface feel needs improvement
   - Cards may overflow or clip on mobile

6. ~~**Specialties not shown in Pokémon card modal**~~ DONE — specialties displayed in detail modal as teal badges.

7. **Zone dashboard missing**
   Need a new view/page: show all Pokémon grouped by zone, and for each zone show which specialties are present and which are missing. Useful for planning habitat construction.

## Game data notes

- **Zones (6):** Palette Town, Withered Wastelands, Bleak Beach, Rocky Ridges, Sparkling Skylands, Cloud Island
- **Specialties:** Appraise, Build, Bulldoze, Burn, Chop, Collect, Crush, DJ, Dream Island, Engineer, Explode, Fly, Gather, Gather Honey, Generate, Grow, Hype, Litter, Paint, Party, Rarify, Recycle, Search, Storage, Teleport, Trade, Transform, Water, Yawn
- **Habitatdex:** 209 total. Only ~100 are documented in the seed. IDs 101-209 are placeholders pending more complete game documentation.
- **Event Pokémon:** not yet added. Need to identify which event Pokémon exist in Pokopia.
- **Special NPCs (IDs 301-307):** Professor Tangrowth, Peakychu, Mosslax, Smearguru, DJ Rotom, Chef Dente, Tinkmaster. These are unique variants, not catchable in the normal sense.

## How to run

```bash
cp .env.example .env
# Edit .env — set DB_PASSWORD and SECRET_KEY
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
- `noUnusedLocals` and `noUnusedParameters` are set to `false` in tsconfig to avoid noise during development.
- The `// eslint-disable-next-line react-hooks/exhaustive-deps` comments in Pokedex/Habitatdex pages suppress warnings about the guest store not being a proper dependency — acceptable tradeoff for now.
