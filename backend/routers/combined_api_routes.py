# files used for combined apis in one function to combine data from multiple apis
from utils.schemas.igdb import GameConsoleCombinedSearch
from fastapi import APIRouter, Depends, HTTPException, status


from routers.igdb_routes import game_search, search_platforms

combo_router = APIRouter(prefix="/combo", tags=["combo"])


@combo_router.post("/search")
async def search(criteria: GameConsoleCombinedSearch):
    games = []
    consoles = []
    try:
        gameRes = await game_search(criteria.game)
        games = gameRes.get("data", [])
        
        consoleRes = await search_platforms(criteria.platform.query, criteria.platform.limit)
        consoles = consoleRes.get("data", [])
        
    except HTTPException as e:
        if e.status_code != 404:
            raise
    
    return {
        "data": {
            "games": games,
            "consoles": consoles
        }
    }