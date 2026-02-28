import axios, { AxiosError } from "axios";
import { Result } from "../types";
import { toApiError } from "../utils";
import { url_omega } from "../constants";


export const getPlatforms = async (): Promise<Result<any>> => {
    try {
        const response = await axios.get(`${url_omega}/tgdb/platforms`);
        console.log(response)
        return { ok: true, data: response.data.data };
    } catch (err) {
        return { ok: false, error: toApiError(err) };
    }
}

export const getPlatformDetails = async (consoleId: string): Promise<Result<any>> => {
    try {
        const response = await axios.get(`${url_omega}/tgdb/platforms/single`, {
            params: { console_id: consoleId }
        });
        console.log(response)
        return { ok: true, data: response };
    } catch (err) {
        return { ok: false, error: toApiError(err) };
    }
}


