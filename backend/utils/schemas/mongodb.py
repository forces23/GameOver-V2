from pydantic import BaseModel


class GameCopies(BaseModel):
    platform: str
    media_type: str
    condition: str
    purchase_date: int
    purchase_price: float
    storage_location: str
    copies: int
    copy_notes: str

class GameCreate(BaseModel):
    igdb_id: int
    name: str
    cover_url: str | None = None
    first_release_date: int
    genres: list
    collected: bool = False
    wishlist: bool = False
    favorite: bool = False
    rating: int
    notes: str
    copies: list[GameCopies]
    
class Image(BaseModel):
    filename:str
    public_url:str

class ProfilePut(BaseModel):  
    display_name: str
    bio: str
    email_visible: bool
    avatar: Image
    banner: Image
    owned_systems: list[object]
    
