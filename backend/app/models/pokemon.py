from sqlalchemy import String, Boolean, Integer
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Pokemon(Base):
    __tablename__ = "pokemon"

    id: Mapped[int] = mapped_column(primary_key=True)  # Pokopia Pokédex number
    name_en: Mapped[str] = mapped_column(String(100))
    name_es: Mapped[str] = mapped_column(String(100))
    types: Mapped[list[str]] = mapped_column(ARRAY(String))
    specialties: Mapped[list[str]] = mapped_column(ARRAY(String))
    generation: Mapped[int] = mapped_column(Integer)
    is_legendary: Mapped[bool] = mapped_column(Boolean, default=False)
    is_mythical: Mapped[bool] = mapped_column(Boolean, default=False)
    is_special_npc: Mapped[bool] = mapped_column(Boolean, default=False)
    is_event: Mapped[bool] = mapped_column(Boolean, default=False)
    sprite_key: Mapped[str] = mapped_column(String(150))  # wikidex filename key
