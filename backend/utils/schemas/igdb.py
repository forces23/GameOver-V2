from pydantic import BaseModel


class IGDBGameSearchPayload(BaseModel):
    query: str = ""
    genres: list[int] = []
    themes: list[int] = []
    consoles: list[int] = []
    gameModes: list[int] = []
    fromDate: str | None = None
    toDate: str | None = None
    page: int = 1
    limit: int = 25
    sort: str = "asc"

class PlatformSearchPayload(BaseModel):
    query: str = ""
    limit: int = 25
    
class GameConsoleCombinedSearch(BaseModel):
    game: IGDBGameSearchPayload
    platform: PlatformSearchPayload