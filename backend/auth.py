from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
import httpx
from jose import jwt
from dotenv import load_dotenv

# Load environment variables
load_dotenv(".env")

auth0_audience = os.getenv("AUTH0_AUDIENCE")
auth0_domain = os.getenv("AUTH0_DOMAIN")
security = HTTPBearer()

async def get_jwks():
    """Fetch Auth0's public keys"""
    jwks_url = f"https://{auth0_domain}/.well-known/jwks.json"
    async with httpx.AsyncClient() as client:
        response = await client.get(jwks_url)
        return response.json()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token and return user ID"""
    token = credentials.credentials
    
    # Get the kid from token header (unverified)
    unverified_header = jwt.get_unverified_header(token)
    
    # Fetch JWKS
    jwks = await get_jwks()
    
    # Find the right key
    rsa_key = {}
    for key in jwks["keys"]:
        if key["kid"] == unverified_header["kid"]:
            rsa_key = {
                "kty": key["kty"],
                "kid": key["kid"],
                "use": key["use"],
                "n": key["n"],
                "e": key["e"]
            }
            break
    
    if not rsa_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unable to find appropriate key"
        )
    
    try:
        # Verify and decode the token
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            audience=auth0_audience,
            issuer=f"https://{auth0_domain}/"
        )
        return payload["sub"]  # Returns user ID like "auth0|123456"
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )
