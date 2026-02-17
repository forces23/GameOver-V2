import axios from "axios";
import { GameData } from "../types";
import { ApiError } from "./igdb";

const url_igdb_t_original = process.env.NEXT_PUBLIC_URL_IGDB_T_ORIGINAL;
const url_omega = process.env.NEXT_PUBLIC_URL_OMEGA;
const ep_db_save_game = process.env.NEXT_PUBLIC_EP_DB_SAVE_GAME;

const todaysDate = Math.floor(Date.now() / 1000);

type PostResp = {data:{game_id:String}; message:String}

type PostResult<T> = {ok: true; data: T;} | {ok: false; error: ApiError}

export const saveGame = async (
    gameDetails: GameData, 
    collected?: Boolean, 
    want?: Boolean,
    accessToken?: string 
): Promise<PostResult<PostResp>> => {
    console.log(`${url_omega}${ep_db_save_game}`)
    try {
        const response = await axios.post(`${url_omega}${ep_db_save_game}`, {
            "igdb_id": gameDetails.id,
            "name": gameDetails.name,
            // "platform": gameDetails.platform,
            "cover_url": `${url_igdb_t_original}${gameDetails.cover.image_id}`,
            "collected": collected,
            "want": want,
            // "notes": game.notes,
            "added_at": todaysDate
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch game details:", error);
        throw error; // Re-throw so caller can handle it
    }
}
