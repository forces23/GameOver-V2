from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # APP
    APP_NAME:str = "GameOverAPI"
    DEBUG:bool = False
    
    # Price Charting
    URL_PRICE_CHARTING:str
    API_KEY_PC:str
    
    # TheGameDB
    API_KEY_TGDB_PUBLIC:str
    API_KEY_TGDB_PRIVATE:str
    
    # IGDB
    URL_IGDB:str
    API_KEY_IGDB_CLIENT_SECRET:str
    API_KEY_IGDB_CLIENT_ID:str
    TWITCH_ACCESS_TOKEN:str
    
    # Auth0
    AUTH0_AUDIENCE:str
    AUTH0_DOMAIN:str
    AUTH0_ISSUER:str
    
    # MongoDB
    MONGO_URI:str
    MONGO_DB:str
    
    
    # class config:
    #     env_file = ".env"
    
    model_config = SettingsConfigDict(
        env_file = (".env", ".env.local"),
        env_file_encoding = "utf-8"
    )
        
settings = Settings()