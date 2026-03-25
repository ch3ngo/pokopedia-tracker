from sqlalchemy import String, Boolean, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

ZONES = [
    "palette_town",
    "withered_wastelands",
    "bleak_beach",
    "rocky_ridges",
    "sparkling_skylands",
    "cloud_island",
]


class PokemonProgress(Base):
    __tablename__ = "pokemon_progress"
    __table_args__ = (UniqueConstraint("user_id", "pokemon_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    pokemon_id: Mapped[int] = mapped_column(Integer, ForeignKey("pokemon.id"))
    is_seen: Mapped[bool] = mapped_column(Boolean, default=False)
    is_caught: Mapped[bool] = mapped_column(Boolean, default=False)
    zone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)


class HabitatProgress(Base):
    __tablename__ = "habitat_progress"
    __table_args__ = (UniqueConstraint("user_id", "habitat_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    habitat_id: Mapped[int] = mapped_column(Integer, ForeignKey("habitats.id"))
    is_built: Mapped[bool] = mapped_column(Boolean, default=False)
    pokemon_attracted: Mapped[list[int]] = mapped_column(ARRAY(Integer), default=list)
