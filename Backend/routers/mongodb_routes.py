## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##     
#                        MongoDB API Calls
## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##  
import httpx
from mongodb import get_db
from config import settings
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from auth import get_current_user
from datetime import datetime
from pymongo.errors import DuplicateKeyError, ServerSelectionTimeoutError, PyMongoError



mongodb_router = APIRouter(tags=["mongodb"])

class GameCreate(BaseModel):
    igdb_id: int
    name: str
    cover_url: str | None = None
    collected: bool = False
    want: bool = False
    
@mongodb_router.post("/games/save")
async def save_game(
    game: GameCreate,  
    user_id: str = Depends(get_current_user)  # <-- Adds auth requirement
):
    """Save a game to user's collection"""
    db = get_db()
    collection = db["games"]
    
    # prepare game document
    game_doc = {
        "user_id": user_id, # This ties the game to user
        "igdb_id": game.igdb_id,
        "name": game.name,
        "cover_url": game.cover_url,
        "collected": game.collected,
        "want": game.want,
        "added_at": datetime.now()
    }
    
    try:
        # Insert into database
        result = await collection.insert_one(game_doc)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            Detail={
                "code": "GAME_ALREADY_SAVED",
                "message": "This game is already saved for this user.",
                "status": 409,
            }
        )
    except ServerSelectionTimeoutError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "code": "DB_UNAVAILABLE",
                "message": "Database is unavailable right now.",
                "status": 503,
            },
        )
    except PyMongoError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "DB_WRITE_FAILED",
                "message": "Failed to save game.",
                "status": 500,
            },
        )

    
    return {
        "data": {
            "game_id": str(result.inserted_id)
        },
        "message": "Game saved successfully",
        
    }