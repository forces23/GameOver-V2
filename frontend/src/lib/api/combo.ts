import axios, { AxiosError } from "axios";
import { Result } from "../types";
import { toApiError } from "../utils";

const url_omega = process.env.NEXT_PUBLIC_URL_OMEGA

export const getSearchResults = async (input:string): Promise<Result<any>> => {
    try {
        const response = await axios.get(`${url_omega}/combo/search`, {
            params: { searchStr: input },
        });
        console.log(response)
        return { ok: true, data: response.data.data };
    } catch (err) {
        return { ok: false, error: toApiError(err) };
    }
}
