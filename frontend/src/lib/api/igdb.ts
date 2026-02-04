import axios from "axios";

const url_omega = process.env.NEXT_PUBLIC_URL_OMEGA;
const ep_game_deatils = process.env.NEXT_PUBLIC_EP_GAME_DEATILS;
const ep_quick_search = process.env.NEXT_PUBLIC_EP_QUICK_SEARCH
const ep_upcoming_games = process.env.NEXT_PUBLIC_EP_UPCOMING_GAMES
const ep_upcoming_events = process.env.NEXT_PUBLIC_EP_UPCOMING_EVENTS
const ep_all_time_favs = process.env.NEXT_PUBLIC_EP_ALL_TIME_FAVS

const todaysDate = Math.floor(Date.now() / 1000);

export const getGameDetails = async (gameId: string) => {
    try {
        const response = await axios.get(`${url_omega}${ep_game_deatils}`, {
            params: { id: gameId }
        });
        return response.data[0];
    } catch (error) {
        console.error("Failed to fetch game details:", error);
    }
}

export const getQuickSearchInfo = async (gameTitle: string) => {
    try {
        const response = await axios.get(`${url_omega}${ep_quick_search}`, {
            params: { q: gameTitle },
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch game details:", error);
    }
}


export const getUpcomingEvents = async () => {
    try {
        const response = await axios.get(`${url_omega}${ep_upcoming_events}`, {
            params: { currentDate: todaysDate }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch upcoming events:", error);
    }
}

export const getUpcomingReleases = async () => {
    try {
        const response = await axios.get(`${url_omega}${ep_upcoming_games}`, {
            params: { currentDate: todaysDate }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch upcoming events:", error);
    }

}

export const getAllTimeFavorites = async () => {
    try {
        const response = await axios.get(`${url_omega}${ep_all_time_favs}`, {
            params: { currentDate: todaysDate }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch upcoming events:", error);
    }

}