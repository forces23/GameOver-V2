# files used for combined apis in one function to combine data from multiple apis
from fastapi import APIRouter, Depends, HTTPException, status

from routers.tgdb_routes import search_platforms
from routers.igdb_routes import quick_search

combo_router = APIRouter(prefix="/combo", tags=["combo"])

@combo_router.get("/search")
async def search(searchStr: str):
    gameRes = await quick_search(searchStr)
    # print(gameRes)
    
    # consoleRes = await search_platforms(searchStr)
    # print (consoleRes)
    
    return {
        "data": {
            "games": gameRes["data"],
            "consoles": []
            # "consoles": consoleRes["data"]
        }
    }