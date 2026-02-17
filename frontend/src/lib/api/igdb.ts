import axios, { AxiosError } from "axios";
import { AllTimeFavs, GameData, QuickSearch, UpcomingEvents, UpcomingReleases } from "../types";

const url_omega = process.env.NEXT_PUBLIC_URL_OMEGA;
const ep_game_details = process.env.NEXT_PUBLIC_EP_GAME_DETAILS;
const ep_quick_search = process.env.NEXT_PUBLIC_EP_QUICK_SEARCH
const ep_upcoming_games = process.env.NEXT_PUBLIC_EP_UPCOMING_GAMES
const ep_upcoming_events = process.env.NEXT_PUBLIC_EP_UPCOMING_EVENTS
const ep_all_time_favs = process.env.NEXT_PUBLIC_EP_ALL_TIME_FAVS

const todaysDate = Math.floor(Date.now() / 1000);

export type ApiError = {
    status: number;
    code: string;
    message: string;
}
type Result<T> = {ok: true; data: T;} | {ok: false;error: ApiError}

const toApiError = (err: unknown): ApiError => {
    const e = err as AxiosError<any>;
    const detail = e.response?.data?.detail;
    return {
        status: e.response?.status ?? 0,
        code: detail?.code ?? "UNKNOWN_ERROR",
        message: detail?.message ?? e.message ?? "Request failed",
    }
}

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

export const getUpcomingReleases = async (): Promise<Result<UpcomingReleases[]>> => {
    try {
        const response = await axios.get<{ data: UpcomingReleases[] }>(`${url_omega}${ep_upcoming_games}`, {
            params: { currentDate: todaysDate }
        });
        return { ok: true, data: response.data.data };
    } catch (err) {
        return { ok: false, error: toApiError(err) };
    }
}

export const getAllTimeFavorites = async (): Promise<Result<AllTimeFavs[]>> => {
    try {
        const response = await axios.get<{ data: AllTimeFavs[] }>(`${url_omega}${ep_all_time_favs}`, {
            params: { currentDate: todaysDate }
        });
        return { ok: true, data: response.data.data };
    } catch (err) {
        return { ok: false, error: toApiError(err) }
    }
}