from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.pokemon import Pokemon
from app.schemas.pokemon import PokemonOut

router = APIRouter(prefix="/api/pokemon", tags=["pokemon"])


@router.get("", response_model=list[PokemonOut])
async def get_all_pokemon(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Pokemon).order_by(Pokemon.id))
    return result.scalars().all()


@router.get("/{pokemon_id}", response_model=PokemonOut)
async def get_pokemon(pokemon_id: int, db: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException
    result = await db.execute(select(Pokemon).where(Pokemon.id == pokemon_id))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Pokémon not found")
    return p
