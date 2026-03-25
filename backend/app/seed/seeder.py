from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import AsyncSessionLocal
from app.models.pokemon import Pokemon
from app.models.habitat import Habitat
from app.seed.pokemon_data import POKEMON_DATA
from app.seed.habitats_data import HABITATS_DATA


async def seed_if_empty():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Pokemon).limit(1))
        if result.scalar_one_or_none() is not None:
            return  # Already seeded

        print("Seeding Pokopia database...")
        await _seed_pokemon(db)
        await _seed_habitats(db)
        await db.commit()
        print(f"Seeded {len(POKEMON_DATA)} Pokémon and {len(HABITATS_DATA)} habitats.")


async def _seed_pokemon(db: AsyncSession):
    for entry in POKEMON_DATA:
        db.add(Pokemon(**entry))


async def _seed_habitats(db: AsyncSession):
    for entry in HABITATS_DATA:
        db.add(Habitat(**entry))
