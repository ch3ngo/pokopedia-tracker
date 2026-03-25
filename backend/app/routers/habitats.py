from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.habitat import Habitat
from app.schemas.habitat import HabitatOut

router = APIRouter(prefix="/api/habitats", tags=["habitats"])


@router.get("", response_model=list[HabitatOut])
async def get_all_habitats(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Habitat).order_by(Habitat.id))
    return result.scalars().all()


@router.get("/{habitat_id}", response_model=HabitatOut)
async def get_habitat(habitat_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Habitat).where(Habitat.id == habitat_id))
    h = result.scalar_one_or_none()
    if not h:
        raise HTTPException(status_code=404, detail="Habitat not found")
    return h
