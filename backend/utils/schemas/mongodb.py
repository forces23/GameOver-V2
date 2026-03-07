from pydantic import BaseModel


class GameCreate(BaseModel):
    igdb_id: int
    name: str
    cover_url: str | None = None
    first_release_date: int
    genres: list
    collected: bool = False
    wishlist: bool = False
    favorite: bool = False
    
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