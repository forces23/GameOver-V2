

// URL PREFIXES
export const url_omega = "http://127.0.0.1:8000";
// export const url_omega = "https://pfzcrggqfu.us-east-1.awsapprunner.com";



// URL ENDPOINTS
export const ep_db_save_game = "/games/save";
export const ep_db_delete_game = "/games/delete";
// export const ep_quick_search = "/igdb/games/quick-search"
export const ep_game_details = "/igdb/games/full-game-details"
export const ep_upcoming_games = "/igdb/games/upcoming-games"
export const ep_upcoming_events = "/igdb/events/upcoming-events"
export const ep_all_time_favs = "/igdb/games/all-time-favs"


// IMAGES
export const outOfOrder = '/imgs/out-of-order.jpg';
export const missingImg = '/imgs/missing-image.png';
export const missingImgGrey = '/imgs/missing-image-grey-300.png';

// IGDB IMAGE SIZE URL
export const url_igdb_t_thumb = "https://images.igdb.com/igdb/image/upload/t_thumb/"
export const url_igdb_t_original = "https://images.igdb.com/igdb/image/upload/t_original/"
export const url_igdb_t_1080p = "https://images.igdb.com/igdb/image/upload/t_1080p/"
export const url_igdb_t_cover_big_2x = "https://images.igdb.com/igdb/image/upload/t_cover_big_2x/"
export const url_igdb_t_screenshot_med = "https://images.igdb.com/igdb/image/upload/t_screenshot_med/"
export const url_igdb_t_screenshot_huge = "https://images.igdb.com/igdb/image/upload/t_screenshot_huge/"
export const url_igdb_t_720p = "https://images.igdb.com/igdb/image/upload/t_720p/"



export const sortByFilters = [
    { key: "name asc", name: "Alphabetical", slug: "alphabetical" },
    { key: "hypes desc", name: "Most Popular", slug: "most-popular" },
    { key: "_score desc", name: "Relevance", slug: "relevance" },
    { key: "total_rating_count desc", name: "Highly Rated", slug: "highly-rated" },
    { key: "total_rating_count asc", name: "Least Rated", slug: "least-rated" },
    { key: "first_release_date asc", name: "Oldest First", slug: "oldest-first" },
    { key: "first_release_date desc", name: "Newest First", slug: "newest-first" },
]



