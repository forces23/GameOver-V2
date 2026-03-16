import axios from "axios";
import { ApiError, GameData, Profile } from "../types";
import { ep_db_delete_game, ep_db_save_game, url_igdb_t_original, url_omega } from "../constants";

const todaysDate = Math.floor(Date.now() / 1000);

type Resp = { data: { game_id: String }; message: String }

type Result<T> = { ok: true; data: T; } | { ok: false; error: ApiError }

type GameExtraDetails = {
    rating: number,
    notes: string,
    copies: {
        platform: {
            igdb_id: number,
            slug: string,
            name: string,
        },
        media_type: string,
        condition: string,
        purchase_date: number,
        purchase_price: number,
        storage_location: string,
        copies: number,
        copy_notes: string
    }[]
}

export const gameCheck = async (igdb_id: number, accessToken?: string) => {
    const response = await axios.get(`${url_omega}/games/check/${igdb_id}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    return response;
}


export const saveGame = async (
    gameDetails: GameData,
    extraDetails: GameExtraDetails | null,
    accessToken: string,
    collected?: Boolean,
    wishlist?: Boolean,
    favorite?: Boolean,
): Promise<Result<Resp>> => {

    console.log(gameDetails);
    console.log(extraDetails);
    try {
        const response = await axios.post(`${url_omega}${ep_db_save_game}`, {
            "igdb_id": gameDetails.id,
            "name": gameDetails.name,
            "cover_url": `${url_igdb_t_original}${gameDetails?.cover?.image_id}.jpg`,
            "first_release_date": gameDetails.first_release_date,
            "genres": gameDetails.genres,
            "collected": collected,
            "wishlist": wishlist,
            "favorite": favorite,
            "added_at": todaysDate,
            "rating": extraDetails?.rating || 0,
            "notes": extraDetails?.notes || "",
            "copies": extraDetails?.copies || []
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
        return {
            ok: false,
            error: {
                status: 502,
                code: "PROFILE_UPDATE_FAILED",
                message: `When trying to update the users profile data a error occurred`,
            }
        }
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
        return {
            ok: false,
            error: {
                status: 502,
                code: "PROFILE_RETRIEVAL_FAILED",
                message: `When trying to retrieve the users profile data a error occurred`,
            }
        }
    }
}

export const getFavorites = async (accessToken: string): Promise<Result<any>> => {
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