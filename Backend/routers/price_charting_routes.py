## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##     
#                        Price Charting API Calls
## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##   

import httpx
from config import settings
from fastapi import APIRouter

price_chart_router = APIRouter(tags=["price-charting"])

@price_chart_router.get("/search-products/{query}")
async def search_products(query:str):
    url = f'{settings.URL_PRICE_CHARTING}/products'
    params = {
        "t":settings.API_KEY_PC, 
        "q":query
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        return response.json()
    
    
@price_chart_router.get("/search-product")
async def search_product(
    id:str | None = None,
    upc: str | None = None,
    q: str | None = None
):
    url = f'{settings.URL_PRICE_CHARTING}/product'
    params = {
        "t": settings.API_KEY_PC,
        "id": id,
        "upc": upc,
        "q": q
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        return response.json()