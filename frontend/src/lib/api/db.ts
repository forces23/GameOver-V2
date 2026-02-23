import axios from "axios";
import { ApiError, GameData, Profile } from "../types";

const url_igdb_t_original = process.env.NEXT_PUBLIC_URL_IGDB_T_ORIGINAL;
const url_omega = process.env.NEXT_PUBLIC_URL_OMEGA;
const ep_db_save_game = process.env.NEXT_PUBLIC_EP_DB_SAVE_GAME;
const ep_db_delete_game = process.env.NEXT_PUBLIC_EP_DB_DELETE_GAME;

const todaysDate = Math.floor(Date.now() / 1000);

type Resp = { data: { game_id: String }; message: String }

type Result<T> = { ok: true; data: T; } | { ok: false; error: ApiError }


export const gameCheck = async (igdb_id: number, accessToken?: string) => {
    console.log(`${url_omega}/games/check/${igdb_id}`);
    const response = await axios.get(`${url_omega}/games/check/${igdb_id}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    return response;
}


export const saveGame = async (
    gameDetails: GameData,
    accessToken: string,
    collected?: Boolean,
    wishlist?: Boolean,
    favorite?: Boolean,
): Promise<Result<Resp>> => {

    console.log(gameDetails)
    try {
        const response = await axios.post(`${url_omega}${ep_db_save_game}`, {
            "igdb_id": gameDetails.id,
            "name": gameDetails.name,
            "cover_url": `${url_igdb_t_original}${gameDetails.cover.image_id}.jpg`,
            "first_release_date": gameDetails.first_release_date,
            "genres": gameDetails.genres,
            "collected": collected,
            "wishlist": wishlist,
            "favorite": favorite,
            "added_at": todaysDate
            // "platform": gameDetails.platform,
            // "notes": game.notes,
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        return { ok: true, data: response.data };
    } catch (error) {
        console.error("Failed to fetch game details:", error);
        throw error; // Re-throw so caller can handle it
    }
}

export const deleteGame = async (igdb_id: number, accessToken: string): Promise<Result<any>> => {
    try {
        const response = await axios.delete(`${url_omega}${ep_db_delete_game}`, {
            params: { igdb_id },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        return { ok: true, data: response.data };
    } catch (err) {
        console.error("Failed to DELETE game details:", err);
        throw err; // Re-throw so caller can handle it
    }

}

export const getCollectedGames = async (category: string, accessToken: string): Promise<Result<any>> => {
    try {
        const response = await axios.get(`${url_omega}/user/game/collection`, {
            params: { category },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        return { ok: true, data: response.data.data };
    } catch (err) {
        console.error("Failed to fetch user collected games:", err);
        throw err; // Re-throw so caller can handle it
    }
}


export const updateProfile = async (profile: Profile, accessToken: string): Promise<Result<any>> => {
    try {
        const resp = await axios.put(`${url_omega}/user/save/profile`,
            profile,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })

        return { ok: true, data: resp }
    } catch (err) {
        console.error("Failed to push user profile data:", err);
        throw err; // Re-throw so caller can handle it
    }
}

export const getProfile = async (accessToken: string): Promise<Result<any>> => {
    try {
        const response = await axios.get(`${url_omega}/user/profile`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })

        return { ok: true, data: response.data.data }
    } catch (err) {
        console.error("Failed to get user profile data:", err);
        throw err; // Re-throw so caller can handle it
    }
}

export const getFavorites = async (accessToken:string): Promise<Result<any>> => {
    try {
        const response = await axios.get(`${url_omega}/user/games/favorites`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })

        return { ok: true, data: response.data.data }
    } catch (err) {
        console.error("Failed to get users favorite games data:", err);
        throw err; // Re-throw so caller can handle it
    }

}