from utils.constatnts import MONGO_DB
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv, dotenv_values


load_dotenv(".env")
load_dotenv(".env.local")

_client = None

def get_client():
    """Get MongoDB client (singleton pattern)"""
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(os.getenv("MONGO_URI"))
    return _client

def get_db():
    """Get the gameover database"""
    return get_client()[MONGO_DB]