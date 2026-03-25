from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.database import get_db
from app.models.user import User
from app.models.progress import PokemonProgress, HabitatProgress
from app.models.pokemon import Pokemon
from app.models.habitat import Habitat
from app.schemas.progress import (
    PokemonProgressOut,
    PokemonProgressUpdate,
    HabitatProgressOut,
    HabitatProgressUpdate,
    FullProgressExport,
)
from app.auth import get_current_user

router = APIRouter(prefix="/api/progress", tags=["progress"])


@router.get("/export", response_model=FullProgressExport)
async def export_progress(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    pk_result = await db.execute(
        select(PokemonProgress).where(PokemonProgress.user_id == current_user.id)
    )
    hab_result = await db.execute(
        select(HabitatProgress).where(HabitatProgress.user_id == current_user.id)
    )
    return FullProgressExport(
        pokemon=pk_result.scalars().all(),
        habitats=hab_result.scalars().all(),
    )


@router.get("/pokemon", response_model=list[PokemonProgressOut])
async def get_pokemon_progress(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(PokemonProgress).where(PokemonProgress.user_id == current_user.id)
    )
    return result.scalars().all()


@router.put("/pokemon/{pokemon_id}", response_model=PokemonProgressOut)
async def update_pokemon_progress(
    pokemon_id: int,
    body: PokemonProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify pokemon exists
    pk = await db.get(Pokemon, pokemon_id)
    if not pk:
        raise HTTPException(status_code=404, detail="Pokémon not found")

    result = await db.execute(
        select(PokemonProgress).where(
            PokemonProgress.user_id == current_user.id,
            PokemonProgress.pokemon_id == pokemon_id,
        )
    )
    progress = result.scalar_one_or_none()

    if not progress:
        progress = PokemonProgress(user_id=current_user.id, pokemon_id=pokemon_id)
        db.add(progress)

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(progress, field, value)

    await db.commit()
    await db.refresh(progress)
    return progress


@router.get("/habitats", response_model=list[HabitatProgressOut])
async def get_habitat_progress(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(HabitatProgress).where(HabitatProgress.user_id == current_user.id)
    )
    return result.scalars().all()


@router.put("/habitats/{habitat_id}", response_model=HabitatProgressOut)
async def update_habitat_progress(
    habitat_id: int,
    body: HabitatProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    hab = await db.get(Habitat, habitat_id)
    if not hab:
        raise HTTPException(status_code=404, detail="Habitat not found")

    result = await db.execute(
        select(HabitatProgress).where(
            HabitatProgress.user_id == current_user.id,
            HabitatProgress.habitat_id == habitat_id,
        )
    )
    progress = result.scalar_one_or_none()

    if not progress:
        progress = HabitatProgress(user_id=current_user.id, habitat_id=habitat_id)
        db.add(progress)

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(progress, field, value)

    await db.commit()
    await db.refresh(progress)
    return progress
