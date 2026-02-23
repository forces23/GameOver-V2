## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##     
#                             IGDB API Calls
## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##   
import httpx
from config import settings
from fastapi import APIRouter, HTTPException

# igdb_router = APIRouter(prefix="/igdb") # prefix allows you to have the endpoint be /igdb/endpoint
igdb_router = APIRouter(tags=["igdb"])


igdb_headers = {
    "Client-ID": settings.API_KEY_IGDB_CLIENT_ID,
    "Authorization": f'Bearer {settings.TWITCH_ACCESS_TOKEN}',
} 

@igdb_router.get("/quick-search")
async def quick_search(q:str):
    url = f'{settings.URL_IGDB}/games'
    data = f"""
        search "{q}";
        fields 
            cover.*,
            first_release_date,
            name;
        limit 15;
    """
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=igdb_headers, content=data)
            response.raise_for_status()
            
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=504,
                detail={
                    "code": "UPSTREAM_TIMEOUT", 
                    "message": "IGDB timeout on quick search",
                    "status": 504
                }
            )
        except httpx.HTTPStatusError as e:
            raise HTTPException (
                status_code=502,
                detail={
                    "code": "UPSTREAM_ERROR", 
                    "message": "IGDB request failed on quick search",
                    "status": 502
                }
            )
            
        payload = response.json()
        if not payload:
            raise HTTPException(
                status_code=404,
                detail={
                    "code": "GAMES_NOT_FOUND", 
                    "message": f"No games were found with search of {q} in IGDB",
                    "status": 404
                }
            )
            
        return {"data": payload}
        
        

@igdb_router.get("/upcoming-games")
async def upcoming_games(currentDate:str):
    url = f'{settings.URL_IGDB}/games'
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
        try:
            response = await client.post(url, headers=igdb_headers, content=data)
            response.raise_for_status()
            
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=504,
                detail={
                    "code": "UPSTREAM_TIMEOUT", 
                    "message": "IGDB timeout on upcoming games",
                    "status": 504
                }
            )
        except httpx.HTTPStatusError as e:
            raise HTTPException (
                status_code=502,
                detail={
                    "code": "UPSTREAM_ERROR", 
                    "message": "IGDB request failed on upcoming games",
                    "status": 502
                }
            )
            
        payload = response.json()
        if not payload:
            raise HTTPException(
                status_code=404,
                detail={
                    "code": "UPCOMING_GAMES_NOT_FOUND", 
                    "message": f"No upcoming games were found in IGDB",
                    "status": 404
                }
            )
        
        response_release_sorted = sorted(payload, key=lambda x: x['first_release_date'])
            
        return {"data": response_release_sorted}

@igdb_router.get("/upcoming-events")
async def upcoming_events(currentDate:str):
    url = f'{settings.URL_IGDB}/events'
    data = f"""
        fields 
            checksum,
            name,
            slug,
            description,
            start_time,
            end_time,
            time_zone,
            event_logo.image_id,
            event_logo.animated,
            event_logo.url;
        where start_time > {currentDate};
        sort start_time asc;
        limit 10;
    """
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=igdb_headers, content=data)
            response.raise_for_status()
            
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=504,
                detail={
                    "code": "UPSTREAM_TIMEOUT", 
                    "message": "IGDB timeout on upcoming events",
                    "status": 504
                }
            )
        except httpx.HTTPStatusError as e:
            raise HTTPException (
                status_code=502,
                detail={
                    "code": "UPSTREAM_ERROR", 
                    "message": "IGDB request failed on upcoming events",
                    "status": 502
                }
            )
            
        payload = response.json()
        if not payload:
            raise HTTPException(
                status_code=404,
                detail={
                    "code": "UPCOMING_EVENTS_NOT_FOUND", 
                    "message": f"No upcoming events were found in IGDB",
                    "status": 404
                }
            )
            
        return {"data": payload}
    
@igdb_router.get("/igdb/events/single")
async def get_event(event_id:str):
    url = f'{settings.URL_IGDB}/events'
    data = f"""
        fields 
            id,
            checksum,
            created_at,
            description,
            end_time,
            event_logo.image_id,
            event_logo.animated,
            event_logo.url,
            event_networks.network_type.name,
            event_networks.url,
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
        where id = {event_id};
    """
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=igdb_headers, content=data)
            response.raise_for_status()
            
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=504,
                detail={
                    "code": "UPSTREAM_TIMEOUT", 
                    "message": "IGDB timeout on event",
                    "status": 504
                }
            )
        except httpx.HTTPStatusError as e:
            raise HTTPException (
                status_code=502,
                detail={
                    "code": "UPSTREAM_ERROR", 
                    "message": "IGDB request failed on event",
                    "status": e.response.status_code,
                    "upstream": e.response.text
                }
            )
            
        payload = response.json()
        if not payload:
            raise HTTPException(
                status_code=404,
                detail={
                    "code": "UPCOMING_EVENTS_NOT_FOUND", 
                    "message": f"No  event was found in IGDB with checksum of {event_id}",
                    "status": 404
                }
            )
        # print(payload)
        return {"data": payload[0]}

@igdb_router.get("/all-time-favs")
async def all_time_favorites(currentDate:str):
    url = f'{settings.URL_IGDB}/games'
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
    
        
        try:
            response = await client.post(url, headers=igdb_headers, content=data)
            response.raise_for_status()
            
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=504,
                detail={
                    "code": "UPSTREAM_TIMEOUT", 
                    "message": "IGDB timeout on all time favorites",
                    "status": 504
                }
            )
        except httpx.HTTPStatusError as e:
            raise HTTPException (
                status_code=502,
                detail={
                    "code": "UPSTREAM_ERROR", 
                    "message": "IGDB request failed on all time favorites",
                    "status": 502
                }
            )
            
        payload = response.json()
        if not payload:
            raise HTTPException(
                status_code=404,
                detail={
                    "code": "UPCOMING_EVENTS_NOT_FOUND", 
                    "message": f"No all time favorites were found in IGDB",
                    "status": 404
                }
            )
            
        response_rating_sorted = sorted(payload, key=lambda x: x['total_rating'], reverse=True)
            
        return {"data": response_rating_sorted}   

@igdb_router.get("/full-game-details")
async def full_game_details(id:str):
    url = f'{settings.URL_IGDB}/games'
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
        try:
            response = await client.post(url, headers=igdb_headers, content=data)   
            response.raise_for_status()
            
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=504,
                detail={
                    "code": "UPSTREAM_TIMEOUT", 
                    "message": "IGDB timeout",
                    "status": 504
                }
            )
        except httpx.HTTPStatusError as e:
            raise HTTPException (
                status_code=502,
                detail={
                    "code": "UPSTREAM_ERROR", 
                    "message": "IGDB request failed",
                    "status": 502
                }
            )
            
        payload = response.json()
        if not payload:
            raise HTTPException(
                status_code=404,
                detail={
                    "code": "GAME_NOT_FOUND", 
                    "message": f"No game found with id of {id} in IGDB",
                    "status": 404
                }
            )
            
        return {"data": payload[0]}
    
    


# TODO: Set up correct error handling for below endpoints if i end up using them

@igdb_router.get("/cover-image")
async def getCoverImage(cover_id:str):
    url = f'{settings.URL_IGDB}/covers'
    
    data = f"""
        fields *;
        where id = ({cover_id});
    """
    
    async with httpx.AsyncClient() as Client:
        response = await Client.post(url, headers=igdb_headers, content=data)
        
    # print ("response: %s" % str(response.json()))
    return response.json()
