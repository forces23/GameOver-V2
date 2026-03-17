import { getTodaysDate } from "./utils"

export const defaultGameFilters = {
    query: "",
    genres: [],
    themes: [],
    consoles: [],
    gameModes: [],
    sort: "",
    fromDate: "",
    toDate: "",
}

export const atfFilterPayload = {
    "query": "",
    "genres": [],
    "themes": [],
    "consoles": [],
    "fromDate": "",
    "toDate": getTodaysDate().unix,
    "gameModes": [],
    "page": 1,
    "limit": 25,
    "sort": "total_rating_count desc" // IGDB sort
}

export const gpPayload = {
    game: {
        "query": "",
        "genres": [],
        "themes": [],
        "consoles": [],
        "fromDate": "",
        "toDate": "",
        "page": 1,
        "limit": 16,
        "sort": ""
    },
    platform: {
        "query": "",
        "limit": 15
    }
}

// Top 15 consoles
export const top15Consoles = [
    // "n64", 
    "nes",
    // "switch", 
    "switch-2",
    "ps2",
    // "snes", 
    "xbox360",
    // "genesis-slash-megadrive", 
    "xboxone",
    "steam",
    "ps5",
    "ps4--1",
    "series-x-s",
    "xbox",
    "ngc"
];

