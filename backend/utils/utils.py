import datetime
import time
from config import settings
import httpx
from utils.schemas.igdb import IGDBGameSearchPayload

_cached_twitch_tokken: str | None = None
_twitch_tokken_expires_at: float | None = None

async def fetch_twitch_token() -> str:
    global _cached_twitch_tokken, _twitch_tokken_expires_at
    
    now = time.time()
    buffer_seconds = 300
    
    if _cached_twitch_tokken and _twitch_tokken_expires_at and now < (_twitch_tokken_expires_at - buffer_seconds):
        return _cached_twitch_tokken
    
    url = "https://id.twitch.tv/oauth2/token"
    async with httpx.AsyncClient() as client:
        response = await client.post(
            url,
            params={
                "client_id": settings.API_KEY_IGDB_CLIENT_ID,
                "client_secret": settings.API_KEY_IGDB_CLIENT_SECRET,
                "grant_type": "client_credentials",
            }
        )
        response.raise_for_status()
        payload = response.json()
    
        _cached_twitch_tokken = payload["access_token"]
        _twitch_tokken_expires_at = payload["expires_in"]
        
    return _cached_twitch_tokken

def getTimestamp():
    return datetime.datetime.now(datetime.timezone.utc)


def igdb_query_builder(criteria:IGDBGameSearchPayload, fields:str = ""):
    genres = ",".join(f'{id}' for id in criteria.genres)
    themes = ",".join(f'{id}' for id in criteria.themes)
    consoles = ",".join(f'{id}' for id in criteria.consoles)
    gameModes = ",".join(f'{id}' for id in criteria.gameModes)

    filters = []
    
    if genres: filters.append(f"genres = ({genres})")
    if themes: filters.append(f"themes = ({themes})")
    if consoles: filters.append(f"platforms = ({consoles})")
    if gameModes: filters.append(f"game_modes = ({gameModes})")
    if criteria.fromDate: filters.append(f"first_release_date >= {criteria.fromDate}")
    if criteria.toDate: filters.append(f"first_release_date <= {criteria.toDate}") 
    if criteria.query: filters.append(f'name ~ *"{criteria.query}"*')
    
    offset = (criteria.page-1) * criteria.limit
    
    where_line = f"where {" & ".join(filters)};" if filters else ""
    sort_line = f"sort {criteria.sort};" if criteria.sort else "sort _score desc;"
    offset_line = f"offset {offset};" if offset != 0 else ""
    fields_line = f"fields {fields};" if fields else ""
    limit_line = f"limit {criteria.limit};" if criteria.limit else ""
        
    data = f"""
        {fields_line}
        {where_line}
        {sort_line}
        {offset_line}
        {limit_line}
    """
    # print(data)
    return data