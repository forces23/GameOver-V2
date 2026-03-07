import axios, { AxiosError } from "axios";
import { Result } from "../types";
import { toApiError } from "../utils";
import { url_omega } from "../constants";


export const getSearchResults = async (
    criteria: {
        game: {
            query: string,
            genres: number[],
            themes: number[],
            consoles: number[],
            page: number,
            limit: number,
            sort: string
            fromDate: string,
            toDate: string
        },
        platform: {
            query: string,
            limit: number 
        }
    }
): Promise<Result<any>> => {
    try {
        const response = await axios.post(`${url_omega}/combo/search`, criteria);
        console.log(response.data.data)
        return { ok: true, data: response.data.data };
    } catch (err) {
        return { ok: false, error: toApiError(err) };
    }
}
