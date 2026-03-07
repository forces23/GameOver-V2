## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##     
#                             IGDB API Calls
## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##   
from typing import Annotated
import uuid
from config import settings
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
import boto3
from botocore.exceptions import ClientError
from auth import get_current_user

aws_router = APIRouter(prefix="/aws",tags=["aws"])

class UploadReqs(BaseModel):
    key:str 
    filename:str
    contentType:str
    fileType: str = ""
    
fileExtMap = {
    "image/jpeg": ".jpeg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/svg": ".svg",
    "image/webp": ".webp"
}

@aws_router.post("/s3/presigned_url")
def s3_presigned_url(payload: UploadReqs, user_id:str = Depends(get_current_user)):
    s3 = boto3.client("s3", region_name="us-east-1")
    bucket = "gameover-data"
    
    if payload.contentType in fileExtMap:
        fileExt = fileExtMap[payload.contentType]
    else:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_CONTENT_TYPE,
            detail={
                "code": "UNSUPPORTED_FILE_TYPE",
                "message": "The file that was uploaded was not a valid file type for upload.",
                "status": 415,
            }
        )
    
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
            ExpiresIn=300, # 300s = 5mins
        )
        # print(f"UPLOAD_SUCCESS:: {payload.filename}")
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