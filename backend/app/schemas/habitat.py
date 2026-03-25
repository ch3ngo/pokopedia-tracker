from pydantic import BaseModel


class HabitatOut(BaseModel):
    id: int
    name_en: str
    name_es: str
    category: str
    requirements_en: str
    requirements_es: str
    pokemon_ids: list[int]

    model_config = {"from_attributes": True}
