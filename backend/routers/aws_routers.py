## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##     
#                             IGDB API Calls
## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##   
import datetime
from typing import Annotated
import uuid
import httpx
from utils.constatnts import URL_IGDB
from config import settings
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
import boto3
from botocore.exceptions import ClientError
from auth import get_current_user

aws_router = APIRouter(prefix="/aws",tags=["aws"])

# sts = boto3.client("sts")
# print(sts.get_caller_identity())

# i need to create a function that pushes files to a s3 and then returns the public url

def getTimestamp():
    return datetime.datetime.now(datetime.timezone.utc)

class UploadReqs(BaseModel):
    key:str 
    filename:str
    contentType:str
    fileType: str = ""
    
fileExtMap = {
    "image/jpeg": ".jpeg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp"
}

@aws_router.post("/s3/presigned_url")
def s3_presigned_url(payload: UploadReqs, user_id:str = Depends(get_current_user)):
    s3 = boto3.client("s3", region_name="us-east-1")
    
    if payload.contentType in fileExtMap:
        fileExt = fileExtMap[payload.contentType]
    else:
        fileExt = ".bin"
    
    bucket = "gameover-data"
    
    if (payload.fileType):
        key = f"{payload.key}{user_id}/{payload.fileType}{fileExt}"
    else: 
        key = f"{payload.key}{user_id}/{payload.filename}-{uuid.uuid4()}"
        
    try:
        url = s3.generate_presigned_url(
            ClientMethod="put_object",
            Params={
                "Bucket":bucket, 
                "Key":key,
                "ContentType": payload.contentType
            },
            ExpiresIn=3600,
        )
        print(f"UPLOAD_SUCCESS:: {payload.filename}")
    except ClientError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "S3_PRESIGNED_URL_FAILED",
                "message": "Failed to get a presigned url",
                "status": 500,
            }
        )
        
    return {
        "data": {
            "uploadUrl": url,
            "publicUrl": f"https://d337ueu8tpafpu.cloudfront.net/{key}",
            "objectKey": key
            }
    }