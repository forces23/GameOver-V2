from fastapi import FastAPI,Depends,HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2AuthorizationCodeBearer,HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
import httpx
from urllib.parse import urlencode
import os 
from dotenv import load_dotenv, dotenv_values
from typing import List
import asyncio
from pydantic import BaseModel
from datetime import datetime

from auth import get_current_user
from mongodb import get_db

load_dotenv(".env")
load_dotenv(".env.local")
# oauth2 = OAuth2AuthorizationCodeBearer(
#     authorizationUrl="https://YOUR_DOMAIN/authorize",
#     tokenUrl="https://YOUR_DOMAIN/oauth/token"
# )


app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,   # frontend URLs allowed
    allow_credentials=True,
    allow_methods=["*"],     # allow all HTTP methods
    allow_headers=["*"],     # allow all headers
)

url_price_charting = os.getenv("URL_PRICE_CHARTING")
api_key_pc = os.getenv("API_KEY_PC")

url_igdb = os.getenv("URL_IGDB")
api_key_igdb_client_secret = os.getenv("API_KEY_IGDB_CLIENT_SECRET")
api_key_igdb_client_id = os.getenv("API_KEY_IGDB_CLIENT_ID")
twitch_access_token = os.getenv("TWITCH_ACCESS_TOKEN")
auth0_audience = os.getenv("AUTH0_AUDIENCE")
auth0_domain = os.getenv("AUTH0_DOMAIN")

# print(f"""
# Price Charting:
#   URL: {url_price_charting}
#   API Key: {api_key_pc}

# IGDB:
#   URL: {url_igdb}
#   Client ID: {api_key_igdb_client_id}
#   Client Secret: {api_key_igdb_client_secret}

# Twitch:
#   Access Token: {twitch_access_token}
# """)


@app.get("/")
async def root():
    return {"message": "Welcome to the GameOverVault API"}

## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##     
#                        MongoDB API Calls
## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##  
class GameCreate(BaseModel):
    igdb_id: int
    name: str
    # platform: str | None = None
    cover_url: str | None = None
    collected: bool = False
    want: bool = False
    # notes: str | None = None
    
@app.post("/games/save")
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
        # "platform": game.platform,
        "cover_url": game.cover_url,
        "collected": game.collected,
        "want": game.want,
        # "notes": game.notes,
        "added_at": datetime.now()
    }
    
    # Insert into database
    result = await collection.insert_one(game_doc)
    
    return {
        "message": "Game saved sucessfully",
        "game_id": str(result.inserted_id)
    }
    


## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##     
#                        Price Charting API Calls
## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##   
@app.get("/search-products/{query}")
async def search_products(query:str):
    url = f'{url_price_charting}/products'
    params = {
        "t":api_key_pc, 
        "q":query
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        return response.json()
    
    
@app.get("/search-product")
async def search_product(
    id:str | None = None,
    upc: str | None = None,
    q: str | None = None
):
    url = f'{url_price_charting}/product'
    params = {
        "t": api_key_pc,
        "id": id,
        "upc": upc,
        "q": q
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        return response.json()


## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##     
#                             IGDB API Calls
## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##    
igdb_headers = {
    "Client-ID": api_key_igdb_client_id,
    "Authorization": f'Bearer {twitch_access_token}',
} 

@app.get("/quick-search")
async def quick_search(q:str):
    url = f'{url_igdb}/games'
    data = f"""
        search "{q}";
        fields 
            cover.*,
            first_release_date,
            name;
        limit 15;
    """
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=igdb_headers, content=data)
        
    return response.json()

@app.get("/upcoming-games")
async def quick_search(currentDate:str):
    url = f'{url_igdb}/games'
    data = f"""
        fields 
            name, 
            first_release_date, 
            cover.image_id, 
            platforms.name, 
            genres.name,
            game_type.type,
            themes,
            hypes;
        where first_release_date > {currentDate} 
        & game_type = 0 
        & cover != null 
        & genres != (32);
        sort hypes desc;
        limit 25;
    """
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=igdb_headers, content=data)
       
    response = response.json()
    response_release_sorted = sorted(response, key=lambda x: x['first_release_date'])
    
    return response_release_sorted

@app.get("/upcoming-events")
async def upcoming_events(currentDate:str):
    url = f'{url_igdb}/events'
    data = f"""
        fields 
            checksum,
            created_at,
            description,
            end_time,
            event_logo.image_id,
            event_logo.animated,
            event_logo.url,
            event_networks,
            games.name,
            games.cover.image_id,
            live_stream_url,
            name,
            slug,
            start_time,
            time_zone,
            updated_at,
            videos.name,
            videos.game.name,
            videos.game.cover.image_id,
            videos.video_id;
        where start_time > {currentDate};
        sort start_time asc;
        limit 10;
    """
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=igdb_headers, content=data)
        
        return response.json()
    

@app.get("/all-time-favs")
async def all_time_favorites(currentDate:str):
    url = f'{url_igdb}/games'
    data = f"""
        fields 
            name, 
            cover.image_id,
            hypes, 
            first_release_date, 
            total_rating, 
            total_rating_count;
        where hypes != null 
            & first_release_date < {currentDate} 
            & total_rating_count > 1000;
        sort total_rating_count desc;
        limit 25;
    """
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=igdb_headers, content=data)
        
    response = response.json()
    response_rating_sorted = sorted(response, key=lambda x: x['total_rating'], reverse=True)
        
    return response_rating_sorted   

@app.get("/full-game-deatils")
async def full_game_deatils(id:str):
    url = f'{url_igdb}/games'
    data = f"""
        where id = {id};
        fields 
            artworks.*,
            bundles.name,           
            bundles.cover.image_id,
            game_type.*,
            checksum,
            collections.*,
            collections.games.name,
            collections.games.cover.image_id,
            cover.*,
            dlcs.name,
            dlcs.cover.image_id,
            expanded_games.name,
            expanded_games.cover.*,
            expansions.name,
            expansions.cover.image_id,
            first_release_date,
            forks,
            franchises.name,
            franchises.created_at,
            franchises.url,
            franchises.games.name,
            game_engines.*,
            game_engines.companies.name,
            game_engines.platforms.name,
            game_engines.logo.*,
            game_localizations.*,
            game_modes.*,
            game_status.*,
            game_type.*,
            genres.*,
            involved_companies.*,
            involved_companies.game.name,
            involved_companies.company.name,
            keywords.*,
            language_supports.language.name,
            multiplayer_modes.*,
            name,
            parent_game.*,
            platforms.*,
            platforms.platform_logo.image_id,
            platforms.platform_logo.width,
            platforms.platform_logo.height,
            platforms.platform_family.name,
            platforms.websites.url,
            platforms.platform_type.name,
            player_perspectives.*,
            rating,
            rating_count,
            release_dates.*,
            release_dates.release_region.region,
            release_dates.platform.name,
            remakes.name,
            remasters.name,
            screenshots.*,
            similar_games.name,
            similar_games.cover.image_id,
            slug,
            standalone_expansions.name,
            storyline,
            summary,
            tags,
            themes.*,
            total_rating,
            total_rating_count,
            updated_at,
            url,
            version_parent,
            version_title,
            videos.*,
            websites.*,
            websites.type.type;
        limit 15;
    """
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=igdb_headers, content=data)   
    
    formated_response = response.json()
    # print ("response: %s" % response.json())
    return formated_response

@app.get("/platforms")
async def platforms(platform_ids):
    url = f'{url_igdb}/platforms'
    
    ids = ""
    for index,id in enumerate(platform_ids):
        ids = ids + str(id)
        if index < len(platform_ids)-1:
            ids = ids + ","            
    
    data = f"""
        fields *;
        where id = ({ids});
    """
    
    async with httpx.AsyncClient() as Client:
        response = await Client.post(url, headers=igdb_headers, content=data)
        
    # print ("response: %s" % str(response.json()))
    return response.json()



@app.get("/cover-image")
async def getCoverImage(cover_id:str):
    url = f'{url_igdb}/covers'
    
    data = f"""
        fields *;
        where id = ({cover_id});
    """
    
    async with httpx.AsyncClient() as Client:
        response = await Client.post(url, headers=igdb_headers, content=data)
        
    # print ("response: %s" % str(response.json()))
    return response.json()
    
    
