# Pokopedia Tracker

A self-hosted web tracker for **Pokémon Pokopia** (Nintendo Switch 2, 2026).

Pokopia is a life-simulation game where you play as a Ditto and build habitats on an island to attract Pokémon. No battles, no evolutions — just exploration and collection.

This app lets you track your island progress without spoilers, accounts, or cloud sync. Everything runs locally via Docker and saves to your browser's localStorage.

---

## Features

- **Pokédex** — 300 Pokémon + 7 special NPCs. Mark as caught, assign zones, add notes, filter by type or status.
- **Habitatdex** — All 209 habitats. Mark as built, track which Pokémon you've attracted to each one.
- **Zone Dashboard** — 5 game zones. Set comfort level (1–10), see specialty coverage per zone, click any Pokémon to open its full card.
- **Home Dashboard** — Daily reminders (stamp, Mosslax, plants, Dream Island) that auto-reset at 5am. At-a-glance progress for Pokédex, Habitatdex, zones, and your to-do list.
- **To-Do list** — Free-text in-game task checklist, persisted in localStorage.
- **Cross-navigation** — Pokémon cards link to their habitats; habitat cards link back to the Pokédex.
- **Export / Import** — Download your progress as JSON, restore it anytime. Works as a manual backup.
- **Reset** — One-click full progress reset with confirmation dialog.
- **Offline** — No accounts, no internet required after first load. No data leaves your machine.
- **EN / ES** — Full English and Spanish interface including type names, specialty names, and zone names.
- **Dark / light mode**

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Query |
| Backend | FastAPI, SQLAlchemy (async), asyncpg |
| Database | PostgreSQL 16 |
| Runtime | Docker Compose |

The backend is a read-only static data API. All user progress is stored in the browser's localStorage via Zustand persist. The backend is only needed to serve the Pokémon and habitat seed data.

---

## Getting started

### Requirements

- Docker and Docker Compose

### Run

```bash
git clone https://github.com/ch3ngo/pokopedia-tracker.git
cd pokopedia-tracker
cp .env.example .env
# Edit .env and set a DB_PASSWORD
docker compose up --build
```

Open **http://localhost:3000** in your browser.

The database seeds automatically on first start (300 Pokémon, 7 NPCs, 209 habitats).

### Reset the database

Required after pulling updates that change the seed data (e.g. new Pokémon or habitat fixes):

```bash
docker compose down -v
docker compose up --build
```

---

## Environment

Create a `.env` file at the project root:

```env
DB_PASSWORD=yourpasswordhere
```

---

## Local images (optional)

By default, Pokémon sprites are loaded from `img.pokemondb.net`. Habitat images are not available from any external source and show a category emoji as placeholder.

To serve images locally:

- **Pokémon sprites** — place PNG files in `frontend/public/imgs/pokedex/` using the normalized name (e.g. `bulbasaur.png`, `mr-mime.png`, `nidoran-f.png`). The app tries local first, falls back to the external URL.
- **Habitat images** — place PNG files in `frontend/public/imgs/habitatdex/` using the zero-padded habitat ID (e.g. `001.png`, `042.png`, `209.png`). The app tries local first, shows the category emoji if missing.

Files placed in `frontend/public/` are baked into the Docker image at build time. No volume mounting needed.

---

## Project structure

```
pokopedia-tracker/
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app, lifespan seeder
│   │   ├── models/           # SQLAlchemy models
│   │   ├── routers/          # /api/pokemon, /api/habitats
│   │   └── seed/             # All game data (300 Pokémon, 209 habitats)
│   └── Dockerfile
└── frontend/
    ├── src/
    │   ├── pages/            # HomePage, Pokedex, Habitatdex, ZoneDashboard, TodoPage
    │   ├── components/       # PokemonCard, HabitatCard, PokemonDetailModal, StatsRing, ...
    │   ├── store/            # Zustand stores (progress, todos, zones, daily, ui)
    │   ├── services/         # Axios API client
    │   ├── types/            # Shared TypeScript types and zone/type constants
    │   └── i18n/             # en.json, es.json
    ├── public/
    │   └── imgs/             # Local sprites (optional, see above)
    └── Dockerfile
```

---

## Data notes

- **Specialties** (31 total): Appraise, Build, Bulldoze, Burn, Chop, Collect, Crush, DJ, Dream Island, Eat, Engineer, Explode, Fly, Gather, Gather Honey, Generate, Grow, Hype, Illuminate, Litter, Paint, Party, Rarify, Recycle, Search, Storage, Teleport, Trade, Transform, Water, Yawn.
- **Zones** (5): Palette Town, Withered Wastelands, Bleak Beach, Rocky Ridges, Sparkling Skylands.
- **Special NPCs** (IDs 301–307): Professor Tangrowth, Peakychu, Mosslax, Smearguru, DJ Rotom, Chef Dente, Tinkmaster. Not catchable in the normal sense.
- Spanish habitat and specialty names may contain inaccuracies. Contributions welcome.

---

## License

Personal project. No affiliation with Nintendo or The Pokémon Company.
