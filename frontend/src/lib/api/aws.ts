import axios from "axios";
import { url_omega } from "../constants";
import { Result } from "../types";

export const s3PresignedUrl = async (key: string, fileType: string, file: File | null, accessToken: any): Promise<Result<any>> => {
    if (!file) return {
        ok: false,
        error: {
            status: 404,
            code: "MISSING_FILE",
            message: "No file selected",
        }
    }

    try {
        // get presigned url  from backend
        const presignedResp = await axios.post(`${url_omega}/aws/s3/presigned_url`, {
            key: key,
            filename: file.name,
            contentType: file.type || "application/octet-stream",
            fileType: fileType
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const { uploadUrl, publicUrl, objectKey } = presignedResp.data.data;

        // upload directly to S3
        const uploadResp = await fetch(uploadUrl, {
            method: "PUT",
            headers: {
                "Content-Type": file.type || "application/octet-stream",
            },
            body: file,
        });

        if (!uploadResp.ok) {
            return {
                ok: false,
                error: {
                    status: 502,
                    code: "S3_UPLOAD_FAILED",
                    message: `S3 upload failed (${uploadResp.status})`,
                }
            }
        }
        console.log(uploadResp);
        return {
            ok: true,
            data: {
                key: objectKey,
                url: publicUrl,
            }
        };

    } catch (err) {
        console.error("Failed to upload data to s3:", err);
        return {
            ok: false,
            error: {
                status: 502,
                code: "S3_UPLOAD_FAILED",
                message: `S3 upload failed`,
            }
        }
    }

}