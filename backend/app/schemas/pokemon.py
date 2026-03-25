from pydantic import BaseModel


class PokemonOut(BaseModel):
    id: int
    name_en: str
    name_es: str
    types: list[str]
    specialties: list[str]
    generation: int
    is_legendary: bool
    is_mythical: bool
    is_special_npc: bool
    sprite_key: str

    model_config = {"from_attributes": True}
