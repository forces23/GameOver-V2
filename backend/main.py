from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routers.igdb_routes import igdb_router
from routers.tgdb_routes import tgdb_router
from routers.price_charting_routes import price_chart_router
from routers.mongodb_routes import mongodb_router
from routers.combined_api_routes import combo_router

app = FastAPI(title=settings.APP_NAME)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://master.dplvhj1p8mk7a.amplifyapp.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,   # frontend URLs allowed
    allow_credentials=True,
    allow_methods=["*"],     # allow all HTTP methods
    allow_headers=["*"],     # allow all headers
)

app.include_router(igdb_router)
app.include_router(price_chart_router)
app.include_router(mongodb_router)
app.include_router(tgdb_router)
app.include_router(combo_router)


@app.get("/")
async def root():
    return {"message": "Welcome to the GameOverVault API"}


