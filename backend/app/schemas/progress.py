from pydantic import BaseModel


class PokemonProgressOut(BaseModel):
    pokemon_id: int
    is_seen: bool
    is_caught: bool
    zone: str | None
    notes: str | None

    model_config = {"from_attributes": True}


class PokemonProgressUpdate(BaseModel):
    is_seen: bool | None = None
    is_caught: bool | None = None
    zone: str | None = None
    notes: str | None = None


class HabitatProgressOut(BaseModel):
    habitat_id: int
    is_built: bool
    pokemon_attracted: list[int]

    model_config = {"from_attributes": True}


class HabitatProgressUpdate(BaseModel):
    is_built: bool | None = None
    pokemon_attracted: list[int] | None = None


class FullProgressExport(BaseModel):
    pokemon: list[PokemonProgressOut]
    habitats: list[HabitatProgressOut]


class FullProgressImport(BaseModel):
    pokemon: list[PokemonProgressUpdate]
    habitats: list[HabitatProgressUpdate]
