## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##     
#                             IGDB API Calls
## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##   
from typing import Annotated
import httpx
from config import settings
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

# igdb_router = APIRouter(prefix="/igdb") # prefix allows you to have the endpoint be /igdb/endpoint
igdb_router = APIRouter(tags=["igdb"])


igdb_headers = {
    "Client-ID": settings.API_KEY_IGDB_CLIENT_ID,
    "Authorization": f'Bearer {settings.TWITCH_ACCESS_TOKEN}',
} 

@igdb_router.get("/genres")
async def getIGDBGenres():
    url = f'{settings.URL_IGDB}/genres'
    data = f"""
        fields id,name,slug;
        sort name asc;
        limit 500;
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=igdb_headers, content=data)
            response.raise_for_status()
        
        except httpx.HTTPStatusError as e:
            raise HTTPException (
                status_code=502,
                detail={
                    "code": "UPSTREAM_ERROR", 
                    "message": f"IGDB request for genres: {e.response.text}",
                    "status": e.response.status_code
                }
            )
    return {
        "data": response.json()
    }
    
@igdb_router.get("/themes")
async def getIGDBThemes():
    url = f'{settings.URL_IGDB}/themes'
    data = f"""
        fields id,name,slug;
        sort name asc;
        limit 500;
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=igdb_headers, content=data)
            response.raise_for_status()
        
        except httpx.HTTPStatusError as e:
            raise HTTPException (
                status_code=502,
                detail={
                    "code": "UPSTREAM_ERROR", 
                    "message": f"IGDB request for themes: {e.response.text}",
                    "status": e.response.status_code
                }
            )
    return {
        "data": response.json()
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


class SearchPayload(BaseModel):
    query: str = ""
    genres: list[int] = []
    themes: list[int] = []
    consoles: list[int] = []
    fromDate: str | None = None
    toDate: str | None = None
    page: int = 1
    limit: int = 25
    sort: str = "asc"

    
@igdb_router.post("/game-search")
async def quick_search(criteria:SearchPayload):
    url = f'{settings.URL_IGDB}/games'
    
    print(criteria)
    
    genres = ",".join(f'{id}' for id in criteria.genres)
    themes = ",".join(f'{id}' for id in criteria.themes)
    consoles = ",".join(f'{id}' for id in criteria.consoles)

    filters = []
    
    if genres: filters.append(f"genres = ({genres})")
    if themes: filters.append(f"themes = ({themes})")
    if consoles: filters.append(f"platforms = ({consoles})")
    if criteria.fromDate: filters.append(f"first_release_date >= {criteria.fromDate}")
    if criteria.toDate: filters.append(f"first_release_date <= {criteria.toDate}") 
    
    where_line = f"where {" & ".join(filters)};" if filters else ""
    search_line = f'search "{criteria.query.strip()}";' if criteria.query.strip() else ""
    sort_line = f"sort hyp desc;" if not criteria.query.strip() else ""
        
    print(where_line)
    print(search_line)
    
    # sort name {criteria.sort};
    data = f"""
        {search_line}
        fields 
            cover.*,
            first_release_date,
            name;
        {where_line}
        {sort_line}
        limit {criteria.limit};
    """
    
    print(data)
    
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
                    "message": f"No games were found with these filters in IGDB",
                    "status": 404
                }
            )
            
        return {"data": payload, "page": criteria.page}
        
        

@igdb_router.get("/upcoming-games")
async def upcoming_games(currentDate:str, limit:int):
    url = f'{settings.URL_IGDB}/games'
    data = f"""
        fields 
            name, 
            first_release_date, 
            cover.image_id, 
            platforms.name, 
            genres.name,
            genres.slug,
            game_type.type,
            themes.name,
            themes.slug,
            hypes;
        where first_release_date > {currentDate} 
        & game_type = 0 
        & cover != null 
        & genres != (32);
        sort hypes desc;
        limit {limit};
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
async def all_time_favorites(currentDate:str, limit:int = 25):
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
        limit {limit};
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
    

@igdb_router.get("/games/console")
async def all_time_favorites(console_id:str):
    url = f'{settings.URL_IGDB}/games'
    data = f"""
        fields
            id,
            name,
            slug,
            first_release_date,
            cover.image_id,
            platforms,
            genres.name;
        where platforms = ({console_id}) & game_type = 0;
        sort first_release_date desc;
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
                    "message": "IGDB timeout on retrieving console specific games",
                    "status": 504
                }
            )
        except httpx.HTTPStatusError as e:
            raise HTTPException (
                status_code=502,
                detail={
                    "code": "UPSTREAM_ERROR", 
                    "message": "IGDB request failed on retrieving console specific games",
                    "status": 502
                }
            )
            
        payload = response.json()
        if not payload:
            raise HTTPException(
                status_code=404,
                detail={
                    "code": "UPCOMING_EVENTS_NOT_FOUND", 
                    "message": f"No console specific games were found in IGDB",
                    "status": 404
                }
            )
        return {"data": payload}   
    

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


@igdb_router.get("/platforms/single")
async def getPlatformsSingle(console_id:str):
    url = f'{settings.URL_IGDB}/platforms'
    
    data = f"""
        fields 
            abbreviation,
            alternative_name,
            category,
            checksum,
            created_at,
            generation,
            name,
            platform_family.name,
            platform_family.slug,
            platform_logo.alpha_channel,
            platform_logo.animated,
            platform_logo.checksum,
            platform_logo.height,
            platform_logo.width,
            platform_logo.image_id,
            platform_logo.url,
            platform_type.name,
            slug,
            summary,
            updated_at,
            url,
            versions.connectivity,
            versions.cpu,
            versions.graphics,
            versions.main_manufacturer,
            versions.media,
            versions.memory,
            versions.name,
            versions.os,
            versions.output,
            versions.platform_logo.animated,
            versions.platform_logo.image_id,
            versions.platform_logo.url,
            versions.platform_version_release_dates.date,
            versions.platform_version_release_dates.release_region.region,
            versions.resolutions,
            versions.slug,
            versions.sound,
            versions.storage,
            versions.summary,
            versions.url,
            websites.url;
        where id = {console_id};
    """
    
    async with httpx.AsyncClient() as Client:
        
        try:
            response = await Client.post(url, headers=igdb_headers, content=data)  
            response.raise_for_status()
            
            print(response)
            
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=504,
                detail={
                    "code": "UPSTREAM_TIMEOUT", 
                    "message": f"IGDB timeout on getting platform with id:{console_id}",
                    "status": 504
                }
            )
        except httpx.HTTPStatusError as e:
            raise HTTPException (
                status_code=502,
                detail={
                    "code": "UPSTREAM_ERROR", 
                    "message": f"IGDB request failed getting platform with id:{console_id}",
                    "status": 502
                }
            )
            
        payload = response.json()
        if not payload:
            raise HTTPException(
                status_code=404,
                detail={
                    "code": "PLATFORM_NOT_FOUND", 
                    "message": f"No platform found with id of {console_id} in IGDB",
                    "status": 404
                }
            )
            
        return {"data": response.json()}
    
    
    
@igdb_router.get("/platforms")
async def getAllPlatforms():
    url = f'{settings.URL_IGDB}/platforms'
    limit = 500
    data = f"""
        fields 
            abbreviation,
            alternative_name,
            checksum,
            name,
            platform_logo.alpha_channel,
            platform_logo.animated,
            platform_logo.checksum,
            platform_logo.image_id,
            platform_type.name,
            versions.platform_version_release_dates.date,
            versions.slug,
            slug;
        sort name asc;
        limit {limit};
    """
    
    async with httpx.AsyncClient() as Client:
        try:
            response = await Client.post(url, headers=igdb_headers, content=data)  
            response.raise_for_status()
                
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=504,
                detail={
                    "code": "UPSTREAM_TIMEOUT", 
                    "message": f"IGDB timeout on getting all platforms",
                    "status": 504
                }
            )
        except httpx.HTTPStatusError as e:
            raise HTTPException (
                status_code=502,
                detail={
                    "code": "UPSTREAM_ERROR", 
                    "message": f"IGDB request failed getting platforms:: {e.response.text}",
                    "status": e.response.status_code
                }
            )
            
        payload = response.json()
        if not payload:
            raise HTTPException(
                status_code=404,
                detail={
                    "code": "PLATFORMS_NOT_FOUND", 
                    "message": f"No platforms found",
                    "status": 404
                }
            )
            
        return {"data": payload}
    

@igdb_router.get("/platforms/multiple")
async def getMultiplePlatforms(console_list:Annotated[list[str], Query()]):
    slug_list = ",".join(f'"{slug}"' for slug in console_list)
    
    url = f'{settings.URL_IGDB}/platforms'
    limit = 50
    data = f"""
        fields 
            abbreviation,
            alternative_name,
            checksum,
            name,
            platform_logo.alpha_channel,
            platform_logo.animated,
            platform_logo.checksum,
            platform_logo.image_id,
            platform_type.name,
            versions.platform_version_release_dates.date,
            versions.slug,
            slug;
        where slug = ({slug_list});
        sort name asc;
        limit {limit};
    """
    
    async with httpx.AsyncClient() as Client:
        try:
            response = await Client.post(url, headers=igdb_headers, content=data)  
            response.raise_for_status()
                
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=504,
                detail={
                    "code": "UPSTREAM_TIMEOUT", 
                    "message": f"IGDB timeout on getting all platforms",
                    "status": 504
                }
            )
        except httpx.HTTPStatusError as e:
            raise HTTPException (
                status_code=502,
                detail={
                    "code": "UPSTREAM_ERROR", 
                    "message": f"IGDB request failed getting platforms:: {e.response.text}",
                    "status": e.response.status_code
                }
            )
            
        payload = response.json()
        if not payload:
            raise HTTPException(
                status_code=404,
                detail={
                    "code": "PLATFORMS_NOT_FOUND", 
                    "message": f"No platforms found",
                    "status": 404
                }
            )
            
        return {"data": payload}


