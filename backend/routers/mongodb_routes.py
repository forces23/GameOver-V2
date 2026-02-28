## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##     
#                        MongoDB API Calls
## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##  
from fastapi.responses import JSONResponse
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
    first_release_date: int
    genres: list
    collected: bool = False
    wishlist: bool = False
    favorite: bool = False
    
class GameSimple(BaseModel):
    name: str
    cover_url: str
    first_release_date: str | None = None
    genres: list[str] = []

class ProfilePut(BaseModel):  
    display_name: str
    bio: str
    email_visible: bool
    avatar_url: str
    banner_url: str
    owned_systems: list[object]
    # favorite_game_ids: list[GameSimple] = []
    # favorite_platforms: list[str] = []

# Check specific Game id to see if it is saved or collected
@mongodb_router.get("/games/check/{igdb_id}")
async def game_check(igdb_id:int, user_id:str = Depends(get_current_user)):
    db = get_db()
    collection = db["games"]
    
    # searches for a document contain these properties
    doc = await collection.find_one({
        "user_id": user_id,
        "igdb_id": igdb_id
    })
    
    # if no doc was found then return this
    if not doc:
        return {
            "data": {
                "saved": False,
                "wishlist": False,
                "collected": False,
                "favorite": False
            }
        }
        
    # if doc was found then return this
    return {
        "data": {
            "saved": True,
            "wishlist": bool(doc.get("wishlist", False)),
            "collected": bool(doc.get("collected", False)),
            "favorite": bool(doc.get("favorite", False))
        }
    }

# Save a game to user's collection
@mongodb_router.post("/games/save")
async def save_game( game: GameCreate, user_id: str = Depends(get_current_user) ):  # Depends() Adds auth requirement
    db = get_db()
    collection = db["games"]
    
    try:
        # update or insert into database
        result = await collection.update_one(
            {"user_id": user_id, "igdb_id": game.igdb_id},
            {
                "$set": {
                    "name": game.name,
                    "cover_url": game.cover_url,
                    "first_release_date":game.first_release_date,
                    "genres": game.genres,
                    "collected": game.collected,
                    "wishlist": game.wishlist,
                    "favorite": game.favorite,
                    "updated_at": datetime.now()
                },
                "$setOnInsert": {
                    "added_at": datetime.now()
                },
            },
            upsert=True,
        )
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
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
            "game_id": str(result.upserted_id)
        },
        "message": "Game saved successfully",
        
    }
    
@mongodb_router.delete("/games/delete")
async def delete_game(igdb_id:int, user_id:str = Depends(get_current_user)):
    db = get_db()
    collection = db["games"]
    try:
        result = await collection.delete_one({"user_id": user_id, "igdb_id": igdb_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail={
                "code": "GAME_NOT_FOUND",
                "message": "Game Could Not Be Found!",
                "status": 404
            })
            
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "code": "GAME_ALREADY_DELETED",
                "message": "This game is already Deleted for this user.",
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
                "message": "Failed to delete game.",
                "status": 500,
            },
        )
        
    return {
        "data": {
            "game_id": igdb_id
        },
        "message": f"Game with id {igdb_id} was removed users profile successfully!"
    }
    
    
@mongodb_router.get("/user/game/collection")
async def get_user_collection(category:str, user_id:str = Depends(get_current_user)):
    db = get_db()
    collection = db["games"]
    try:
        result =  collection.find(
            {"user_id": user_id, "collected": category == "collected" , "wishlist": category == "wishlist"},
            {"_id": 0}
        )
        
        games = await result.to_list(length=200)
        
    except ServerSelectionTimeoutError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "code": "DB_UNAVAILABLE",
                "message": "Database is unavailable right now.",
                "status": 503,
            },
        )
        
    alpha_sorted = sorted(games, key=lambda x: x["name"])
        
    return {
        "data": {
            "games": alpha_sorted
        },
        "message": "Collected games discovered successfully!"
    }
    
    
@mongodb_router.get("/user/games/favorites")
async def get_user_collection(user_id:str = Depends(get_current_user)):
    db = get_db()
    collection = db["games"]
    try:
        result =  collection.find(
            {"user_id": user_id, 'favorite': True},
            {"_id": 0}
        )
        
        games = await result.to_list(length=200)
        
    except ServerSelectionTimeoutError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "code": "DB_UNAVAILABLE",
                "message": "Database is unavailable right now.",
                "status": 503,
            },
        )
        
    alpha_sorted = sorted(games, key=lambda x: x["name"])
        
    return {
        "data": {
            "data": alpha_sorted
        },
        "message": "Favorite games discovered successfully!"
    }
    
    
# 1. Auth0 = identity source (sub, email, login picture fallback).
# 2. MongoDB = app profile data (bio, banner, favorites, custom avatar URL, preferences).

#   For your case, store in MongoDB:

#   - display_name, bio
#   - avatar_url (custom)
#   - banner_url
#   - favorite_games
#   - app settings

# Upload images to object storage (S3/Cloudinary/etc), store only URLs in Mongo.
@mongodb_router.put("/user/save/profile")
async def upsert_user_profile(payload: ProfilePut, user_id:str = Depends(get_current_user)):
    db = get_db()
    profiles = db["user_profiles"]

    doc = payload.model_dump()
    result = await profiles.update_one( 
        {"user_id": user_id},
        {"$set": {
            **doc, 
            "updated_at": datetime.now()
            },
            "$setOnInsert": {
                "created_at": datetime.now()
            },
        }, 
        upsert=True
    )
    
    created = result.upserted_id is not None
    return JSONResponse(
        status_code=201 if created else 200,
        content={"data": {
            "user_id": user_id, 
            "created": created
            }, 
            "message": "Profile saved"
        }
    )

@mongodb_router.get("/user/profile")
async def get_profile(user_id:str = Depends(get_current_user)):
    db = get_db()
    profiles = db["user_profiles"]
    try:
        result = await profiles.find_one(
            {"user_id": user_id},
            {"_id":0}
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
        
    return {
        "data": {
            "data": result
        },
        "message": "User profile discovered successfully!"
    }