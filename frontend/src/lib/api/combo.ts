import axios, { AxiosError } from "axios";
import { Result } from "../types";
import { toApiError } from "../utils";
import { url_omega } from "../constants";


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
