import axios, { AxiosError } from "axios";
import { AllTimeFavs, ApiError, GameData, QuickSearch, Result, UpcomingEvents, UpcomingReleases, IGDBEvent, IGDBPlatformDetail } from "../types";
import { toApiError } from "../utils";
import qs from "qs";


const url_omega = process.env.NEXT_PUBLIC_URL_OMEGA;
const ep_game_details = process.env.NEXT_PUBLIC_EP_GAME_DETAILS;
const ep_quick_search = process.env.NEXT_PUBLIC_EP_QUICK_SEARCH
const ep_upcoming_games = process.env.NEXT_PUBLIC_EP_UPCOMING_GAMES
const ep_upcoming_events = process.env.NEXT_PUBLIC_EP_UPCOMING_EVENTS
const ep_all_time_favs = process.env.NEXT_PUBLIC_EP_ALL_TIME_FAVS

const todaysDate = Math.floor(Date.now() / 1000);

export const getGameDetails = async (gameId: string): Promise<Result<GameData>> => {
    try {
        const response = await axios.get<{ data: GameData }>(`${url_omega}${ep_game_details}`, {
            params: { id: gameId }
        });
        return { ok: true, data: response.data.data };
    } catch (err) {
        return { ok: false, error: toApiError(err) }
    }
}

export const getIGDBGenres = async (): Promise<Result<any[]>> => {
    try {
        const response = await axios.get<{ data: any[] }>(`${url_omega}/genres`);
        return { ok: true, data: response.data.data };
    } catch (err) {
        return { ok: false, error: toApiError(err) };
    }
}

export const getIGDBThemes = async (): Promise<Result<any[]>> => {
    try {
        const response = await axios.get<{ data: any[] }>(`${url_omega}/themes`);
        return { ok: true, data: response.data.data };
    } catch (err) {
        return { ok: false, error: toApiError(err) };
    }
}

export const getQuickSearchInfo = async (gameTitle: string): Promise<Result<QuickSearch[]>> => {
    try {
        const response = await axios.get<{ data: QuickSearch[] }>(`${url_omega}${ep_quick_search}`, {
            params: { q: gameTitle },
        });
        return { ok: true, data: response.data.data };
    } catch (err) {
        return { ok: false, error: toApiError(err) };
    }
}

export const getGameSearch = async (payload: {
    query: string,
    genres: number[],
    themes: number[],
    consoles: number[],
    page: number,
    limit: number,
    sort: string
    fromDate: string,
    toDate: string
}): Promise<Result<QuickSearch[]>> => {
    try {
        const response = await axios.post<{ data: QuickSearch[] }>(`${url_omega}/game-search`, payload, {
            headers: { "Content-Type": "application/json" }
        });
        return { ok: true, data: response.data.data };
    } catch (err) {
        return { ok: false, error: toApiError(err) };
    }
}

export const getUpcomingEvents = async (): Promise<Result<UpcomingEvents[]>> => {
    try {
        const response = await axios.get<{ data: UpcomingEvents[] }>(`${url_omega}${ep_upcoming_events}`, {
            params: { currentDate: todaysDate }
        });
        return { ok: true, data: response.data.data };
    } catch (err) {
        return { ok: false, error: toApiError(err) };
    }
}

export const getEvent = async (event_id: string): Promise<Result<IGDBEvent>> => {
    try {
        const response = await axios.get<{ data: IGDBEvent }>(`${url_omega}/igdb/events/single`, {
            params: { event_id }
        });
        return { ok: true, data: response.data.data };
    } catch (err) {
        return { ok: false, error: toApiError(err) };
    }
}

export const getUpcomingReleases = async (quantity: number): Promise<Result<UpcomingReleases[]>> => {
    try {
        const response = await axios.get<{ data: UpcomingReleases[] }>(`${url_omega}${ep_upcoming_games}`, {
            params: { currentDate: todaysDate, limit: quantity }
        });
        return { ok: true, data: response.data.data };
    } catch (err) {
        return { ok: false, error: toApiError(err) };
    }
}

export const getAllTimeFavorites = async (limit?: number): Promise<Result<AllTimeFavs[]>> => {
    try {
        const response = await axios.get<{ data: AllTimeFavs[] }>(`${url_omega}${ep_all_time_favs}`, {
            params: { currentDate: todaysDate, limit: limit }
        });
        return { ok: true, data: response.data.data };
    } catch (err) {
        return { ok: false, error: toApiError(err) }
    }
}

export const getConsoleGamesById = async (consoleId: string): Promise<Result<AllTimeFavs[]>> => {
    try {
        const response = await axios.get<{ data: AllTimeFavs[] }>(`${url_omega}/games/console`, {
            params: { console_id: consoleId }
        });
        return { ok: true, data: response.data.data };
    } catch (err) {
        return { ok: false, error: toApiError(err) }
    }
}

export const getAllGames = async (): Promise<Result<AllTimeFavs[]>> => {
    try {
        const response = await axios.get<{ data: AllTimeFavs[] }>(`${url_omega}/games/all`);
        return { ok: true, data: response.data.data };
    } catch (err) {
        return { ok: false, error: toApiError(err) }
    }
}

export const getPlatformById = async (consoleId: string): Promise<Result<IGDBPlatformDetail[]>> => {
    try {
        const response = await axios.get<{ data: IGDBPlatformDetail[] }>(`${url_omega}/platforms/single`, {
            params: { console_id: consoleId }
        });
        return { ok: true, data: response.data.data };
    } catch (err) {
        return { ok: false, error: toApiError(err) }
    }
}

export const getAllPlatforms = async (): Promise<Result<any>> => {
    try {
        const response = await axios.get<{ data: any }>(`${url_omega}/platforms`);
        return { ok: true, data: response.data.data };
    } catch (err) {
        return { ok: false, error: toApiError(err) }
    }
}

export const getMultiplePlatforms = async (consoleList: any[]): Promise<Result<any>> => {
    try {
        const response = await axios.get(`${url_omega}/platforms/multiple`, {
            params: { console_list: consoleList },
            paramsSerializer: (params => qs.stringify(params, { arrayFormat: "repeat" }))
        });
        return { ok: true, data: response.data.data };
    } catch (err) {
        return { ok: false, error: toApiError(err) };
    }
}

