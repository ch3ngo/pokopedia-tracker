from sqlalchemy import String, Text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Habitat(Base):
    __tablename__ = "habitats"

    id: Mapped[int] = mapped_column(primary_key=True)
    name_en: Mapped[str] = mapped_column(String(200))
    name_es: Mapped[str] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(String(50))  # grass, flower, water, specialized, etc.
    requirements_en: Mapped[str] = mapped_column(Text)
    requirements_es: Mapped[str] = mapped_column(Text)
    pokemon_ids: Mapped[list[int]] = mapped_column(ARRAY(String))  # Pokopia IDs that can spawn
