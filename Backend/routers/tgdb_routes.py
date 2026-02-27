## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##     
#                             TGDB API Calls
## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##   
import httpx
from utils.tgdb_helpers import tgdb_normalization
from config import settings
from fastapi import APIRouter, HTTPException

tgdb_router = APIRouter(prefix="/tgdb", tags=["tgdb"])

tgdb_header = {"Accept": "application/json"}


# platform fields
# icon,console,controller,developer,manufacturer,media,cpu,memory,graphics,sound,maxcontrollers,display,overview,youtube
@tgdb_router.get("/platforms")
async def get_all_platforms():
    url = f"{settings.URL_TGDB}/Platforms"
    
    params = {
        "apikey": settings.API_KEY_TGDB_PUBLIC,
        "fields": "icon,console,manufacturer"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params, headers=tgdb_header)
            response.raise_for_status()
            
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=504,
                detail={
                    "code": "UPSTREAM_TIMEOUT", 
                    "message": "TGDB timeout on retrieving platforms",
                    "status": 504
                }
            )
        except httpx.HTTPStatusError as e:
            raise HTTPException (
                status_code=502,
                detail={
                    "code": "UPSTREAM_ERROR", 
                    "message": "TGDB request failed on retrieving platforms",
                    "status": 502
                }
            )
            
    data = response.json()
    # print(data["data"]["platforms"])

    normal_data = tgdb_normalization(data["data"]["platforms"])
    
    return {"data": normal_data}
    
    
@tgdb_router.get("/platforms/single")
async def get_platform_details(console_id:int):
    params_pf_details = {
        "apikey": settings.API_KEY_TGDB_PUBLIC,
        "id": console_id,
        "fields": "icon,console,controller,developer,manufacturer,media,cpu,memory,graphics,sound,maxcontrollers,display,overview,youtube"
    }
    
    params_pf_images = {
        "apikey": settings.API_KEY_TGDB_PUBLIC,
        "platforms_id": console_id,
        "fields": "fanart,banner,boxart"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            details_response = await client.get(
                url=f"{settings.URL_TGDB}/Platforms/ByPlatformID", 
                params=params_pf_details, 
                headers=tgdb_header)
            details_response.raise_for_status()
            
            images_response = await client.get(
                url=f"{settings.URL_TGDB}/Platforms/Images", 
                params=params_pf_images, 
                headers=tgdb_header)
            images_response.raise_for_status()
            
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=504,
                detail={
                    "code": "UPSTREAM_TIMEOUT", 
                    "message": "TGDB timeout on retrieving platform details",
                    "status": 504
                }
            )
        except httpx.HTTPStatusError as e:
            raise HTTPException (
                status_code=502,
                detail={
                    "code": "UPSTREAM_ERROR", 
                    "message": "TGDB request failed on retrieving platform details",
                    "status": e.response.status_code,
                    "upstream": e.response.text
                }
            )
            
    data_details = details_response.json()
    # print(data["data"]["platforms"])
    
    data_images = images_response.json()
    
    images = {"banners":[], "fanarts":[], "boxarts":[], "icons":[], "others":[]}
    for item in data_images["data"]["images"].get(str(console_id),[]):
        if item["type"] == "banner":
            images["banners"].append({"id":item["id"], "filename":item["filename"]})
        elif item["type"] == "fanart":
            images["fanarts"].append({"id":item["id"], "filename":item["filename"]})
        elif item["type"] == "boxart":
            images["boxarts"].append({"id":item["id"], "filename":item["filename"]})
        elif item["type"] == "icon":
            images["icons"].append({"id":item["id"], "filename":item["filename"]})
        else:
            images["others"].append({"id":item["id"],"type":item["type"], "filename":item["filename"]})

    # normal_data = tgdb_normalization(data_details["data"]["platforms"])
    
    return {
        "data": {
            "details": data_details["data"]["platforms"][f"{console_id}"],
            "images" : {
                "base_urls": data_images["data"]["base_url"],
                "images": {
                    "banners": images["banners"] or [],
                    "fanarts": images["fanarts"] or [],
                    "boxarts": images["boxarts"] or [],
                    "icons": images["icons"] or [],
                    "others": images["others"] or []
                }
            } 
        }
    }
    


@tgdb_router.get("/platforms/search")
async def search_platforms(name:str):
    url = f"{settings.URL_TGDB}/Platforms/ByPlatformName"
    
    params = {
        "apikey": settings.API_KEY_TGDB_PUBLIC,
        "name": name,
        "fields": "icon,console,manufacturer"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params, headers=tgdb_header)
            response.raise_for_status()
            
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=504,
                detail={
                    "code": "UPSTREAM_TIMEOUT", 
                    "message": "TGDB timeout on retrieving platforms search details",
                    "status": 504
                }
            )
        except httpx.HTTPStatusError as e:
            raise HTTPException (
                status_code=502,
                detail={
                    "code": "UPSTREAM_ERROR", 
                    "message": "TGDB request failed on retrieving platforms search details",
                    "status": 502
                }
            )
            
    data = response.json()
    # print(data["data"]["platforms"])

    return {"data": data["data"]["platforms"]}
    
@tgdb_router.get("/platforms/images")
async def get_platform(id:str):
    url = f"{settings.URL_TGDB}/Platforms/Images"
    
    params = {
        "apikey": settings.API_KEY_TGDB_PUBLIC,
        "platforms_id": id,
        "fields": "fanart,banner,boxart"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params, headers=tgdb_header)
            response.raise_for_status()
            
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=504,
                detail={
                    "code": "UPSTREAM_TIMEOUT", 
                    "message": "TGDB timeout on retrieving platforms images",
                    "status": 504
                }
            )
        except httpx.HTTPStatusError as e:
            raise HTTPException (
                status_code=502,
                detail={
                    "code": "UPSTREAM_ERROR", 
                    "message": "TGDB request failed on retrieving platforms images",
                    "status": 502
                }
            )
            
    data = response.json()
    # normal_images = tgdb_normalization(data["data"]["images"][id])
    
    # return {"data": normal_data}
    return {
        "data": {
            "base_url": data["data"]["base_url"], 
            "images":data["data"]["images"][id]
        } 
    }
    

    


