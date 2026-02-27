export type ApiError = {
  status: number;
  code: string;
  message: string;
  upstream?: string
}
export type Result<T> = { ok: true; data: T; } | { ok: false; error: ApiError }

export type GameData = {
  id: number;
  artworks: Artwork[];
  bundles: Bundle[];
  cover: Cover;
  dlcs: Dlc[];
  first_release_date: number;
  franchises: Franchise[];
  game_engines: GameEngine[];
  game_modes: GameMode[];
  genres: Genre[];
  involved_companies: InvolvedCompany[];
  keywords: Keyword[];
  multiplayer_modes: MultiplayerMode[];
  name: string;
  platforms: IGDBPlatform[];
  player_perspectives: PlayerPerspective[];
  rating: number;
  rating_count: number;
  release_dates: ReleaseDate[];
  screenshots: Screenshot[];
  similar_games: SimilarGame[];
  slug: string;
  storyline: string;
  summary: string;
  tags: number[];
  themes: Theme[];
  total_rating: number;
  total_rating_count: number;
  updated_at: number;
  url: string;
  videos: Video[];
  websites: Website[];
  checksum: string;
  expanded_games: ExpandedGame[];
  expansions: ExpandedGame[]
  language_supports: LanguageSupport[];
  game_localizations: GameLocalization[];
  collections: Collection[];
  game_type: GameType;
};

export type Artwork = {
  id: number;
  game: number;
  height: number;
  image_id: string;
  url: string;
  width: number;
  checksum: string;
  artwork_type: number;
  alpha_channel?: boolean;
  animated?: boolean;
};

export type Bundle = {
  id: number;
  name: string;
  cover: Cover;
};

export type Cover = {
  id: number;
  alpha_channel?: boolean;
  animated?: boolean;
  game?: number;
  height?: number;
  image_id?: string;
  url?: string;
  width?: number;
  checksum: string;
};

export type Dlc = {
  id: number;
  name: string;
  cover: Cover;
};

export type Franchise = {
  id: number;
  created_at: number;
  games: FranchiseGame[];
  name: string;
  url: string;
};

export type FranchiseGame = {
  id: number;
  name: string;
};

export type GameEngine = {
  id: number;
  companies: GameEngineCompany[];
  created_at: number;
  logo: Logo;
  name: string;
  platforms: GameEnginePlatform[];
  slug: string;
  updated_at: number;
  url: string;
  checksum: string;
};

export type GameEngineCompany = {
  id: number;
  name: string;
};

export type Logo = {
  id: number;
  height: number;
  image_id: string;
  url: string;
  width: number;
  checksum: string;
};

export type GameEnginePlatform = {
  id: number;
  name: string;
};

export type GameMode = {
  id: number;
  created_at: number;
  name: string;
  slug: string;
  updated_at: number;
  url: string;
  checksum: string;
};

export type Genre = {
  id: number;
  created_at: number;
  name: string;
  slug: string;
  updated_at: number;
  url: string;
  checksum: string;
};

export type InvolvedCompany = {
  id: number;
  company: InvolvedCompanyDetail;
  created_at: number;
  developer: boolean;
  game: InvolvedCompanyGame;
  porting: boolean;
  publisher: boolean;
  supporting: boolean;
  updated_at: number;
  checksum: string;
};

export type InvolvedCompanyDetail = {
  id: number;
  name: string;
};

export type InvolvedCompanyGame = {
  id: number;
  name: string;
};

export type Keyword = {
  id: number;
  created_at: number;
  name: string;
  slug: string;
  updated_at: number;
  url: string;
  checksum: string;
};

export type MultiplayerMode = {
  id: number;
  campaigncoop: boolean;
  dropin: boolean;
  game: number;
  lancoop: boolean;
  offlinecoop: boolean;
  onlinecoop: boolean;
  splitscreen: boolean;
  checksum: string;
};

export type IGDBPlatform = {
  id: number;
  abbreviation: string;
  alternative_name: string;
  created_at: number;
  generation: number;
  name: string;
  platform_logo: PlatformLogo;
  platform_family: PlatformFamily;
  slug: string;
  summary?: string;
  updated_at: number;
  url: string;
  versions: number[];
  websites: PlatformWebsite[];
  checksum: string;
  platform_type: PlatformType;
};

export type PlatformLogo = {
  id: number;
  height: number;
  image_id: string;
  width: number;
};

export type PlatformFamily = {
  id: number;
  name: string;
};

export type PlatformWebsite = {
  id: number;
  url: string;
};

export type PlatformType = {
  id: number;
  name: string;
};

export type PlayerPerspective = {
  id: number;
  created_at: number;
  name: string;
  slug: string;
  updated_at: number;
  url: string;
  checksum: string;
};

export type ReleaseDate = {
  id: number;
  created_at: number;
  date: number;
  game: number;
  human: string;
  m: number;
  platform: ReleaseDatePlatform;
  updated_at: number;
  y: number;
  checksum: string;
  date_format: number;
  release_region: ReleaseRegion;
};

export type ReleaseDatePlatform = {
  id: number;
  name: string;
};

export type ReleaseRegion = {
  id: number;
  region: string;
};

export type Screenshot = {
  id: number;
  game: number;
  height: number;
  image_id: string;
  url: string;
  width: number;
  checksum: string;
  alpha_channel?: boolean;
  animated?: boolean;
};

export type SimilarGame = {
  id: number;
  cover: SimilarGameCover;
  name: string;
};

export type SimilarGameCover = {
  id: number;
  image_id: string;
};

export type Theme = {
  id: number;
  created_at: number;
  name: string;
  slug: string;
  updated_at: number;
  url: string;
  checksum: string;
};

export type Video = {
  id: number;
  game: number;
  name: string;
  video_id: string;
  checksum: string;
};

export type Website = {
  id: number;
  game: number;
  trusted: boolean;
  url: string;
  checksum: string;
  type: WebsiteType;
};

export type WebsiteType = {
  id: number;
  type: string;
};

export type ExpandedGame = {
  id: number;
  cover: Cover;
  name: string;
};

export type LanguageSupport = {
  id: number;
  language: Language;
};

export type Language = {
  id: number;
  name: string;
};

export type GameLocalization = {
  id: number;
  name: string;
  game: number;
  region: number;
  created_at: number;
  updated_at: number;
  checksum: string;
};

export type Collection = {
  id: number;
  created_at: number;
  games: CollectionGame[];
  name: string;
  slug: string;
  updated_at: number;
  url: string;
  checksum: string;
  type: number;
};

export type CollectionGame = {
  id: number;
  cover: SimilarGameCover;
  name: string;
};

export type GameType = {
  id: number;
  type: string;
  created_at: number;
  updated_at: number;
  checksum: string;
};

export type UpcomingReleases = {
  id: number;
  name: string;
  first_release_date: number; // UNIX timestamp
  cover?: {
    id: number;
    image_id: string; // IGDB CDN URL (t_thumb etc.)
  };
  genres?: {
    id: number;
    name: string;
    slug: string;
  }[];
  themes?: {
    id: number;
    name: string;
    slug: string;
  }[];
  platforms?: {
    id: number;
    name: string;
  };
}

export type IGDBEvent = {
  id: number;
  checksum: string;
  created_at: number;
  updated_at: number;
  name: string;
  slug: string;
  description?: string;
  start_time?: number;
  end_time?: number;
  time_zone?: string;
  live_stream_url?: string;
  event_logo?: {
    id: number;
    image_id: string;
    animated?: boolean;
    url?: string;
  };
  event_networks?: {
    id: number;
    url: string;
    network_type?: {
      id: number,
      name: string
    }
  }[];
  games?: {
    id: number;
    name: string;
    cover?: {
      id: number;
      image_id: string;
    };
  }[];
  videos?: { //
    id: number;
    name?: string;
    game?: {
      id: number;
      name: string;
      cover?: {
        id: number;
        image_id: string;
      };
    };
    video_id?: string;
  }[];
};

export type UpcomingEvents = {
  id: number;
  checksum: string;
  // created_at: number;
  // updated_at: number;
  name: string;
  slug: string;
  description?: string;
  start_time?: number;
  end_time?: number;
  time_zone?: string;
  // live_stream_url?: string;
  event_logo?: {
    image_id: string;
    animated?: boolean;
    url?: string;
  };
  // event_networks?: number[]; // IGDB returns an array of numeric IDs
  // games?: {
  //   id: number;
  //   name: string;
  //   cover?: {
  //     image_id: string;
  //     id?: number; // IGDB sometimes returns cover.id
  //   };
  // }[];
  // videos?: {
  //   name?: string;
  //   video_id?: string;
  //   game?: {
  //     id: number;
  //     name: string;
  //     cover?: {
  //       image_id: string;
  //       id?: number;
  //     };
  //   };
  // };
};

export interface AllTimeFavs {
  id: number;
  name: string;
  hypes: number | null;
  first_release_date: number;
  total_rating: number | null;
  total_rating_count: number;

  cover?: {
    id: number;
    image_id: string;
  } | null;
}

export type QuickSearch = {
  id: number;
  cover?: Cover | null;
  first_release_date?: number;
  name: string;
}

export type SearchResults = {
  games: QuickSearch[],
  consoles: {
    id: number,
    name: string,
    alias: string
  }[]
}

// TODO: add igdb_id to this for 
export type GameSimple = {
  id: number;
  igdb_id: number;
  name: string;
  cover_url: string;
  first_release_date: number;
  genres: string[];
  collected: boolean;
  wishlist: boolean;
  favorite: boolean;
}

export type TGDBPlatform = {
  id: number;
  name: string;
  alias: string;
  icon: string;
  console: string;
  manufacturer: string;
}

export type Profile = {
  display_name: string
  bio: string
  email_visible: boolean
  avatar_url: string
  banner_url: string
  owned_systems: TGDBPlatform[]
  // favorite_game_ids: GameSimple[]
  // favorite_platforms: string[]
}


export type TGDBImageBaseUrls = {
  original: string;
  small: string;
  thumb: string;
  cropped_center_thumb: string;
  medium: string;
  large: string;
};

export type TGDBPlatformImageFile = {
  id: number;
  filename: string;
  type?: string;
};

export type TGDBPlatformDetails = {
  id: number;
  name: string;
  alias: string;
  icon: string;
  console: string;
  controller: string;
  developer: string;
  manufacturer: string;
  media: string;
  cpu: string;
  memory: string;
  graphics: string;
  sound: string;
  maxcontrollers: string;
  display: string;
  overview: string;
  youtube: string | null;
};

export type TGDBPlatformDetailsImages = {
  base_urls: TGDBImageBaseUrls;
  images: {
    banners: TGDBPlatformImageFile[];
    fanarts: TGDBPlatformImageFile[];
    boxarts: TGDBPlatformImageFile[];
    icons: TGDBPlatformImageFile[];
    others: TGDBPlatformImageFile[];
  };
};

export type TGDBPlatformDetailsResponseData = {
  details: TGDBPlatformDetails;
  images: TGDBPlatformDetailsImages;
};

export type IGDBPlatformDetail = {
    id: number;
    abbreviation: string;
    alternative_name?: string;
    name: string;
    slug: string;
    url: string;
    checksum: string;
    created_at: number;
    updated_at: number;
    generation?: number;
    summary?: string;
    platform_logo?: {
      image_id: string;
      url: string;
      animated?: boolean;
      alpha_channel?: boolean;
      height?: number;
      width?: number;
      checksum?: string;
    };
    platform_family?: { name: string; slug?: string };
    platform_type?: { name: string };
    websites?: { url: string }[];
    versions?: {
      id: number;
      name: string;
      slug: string;
      url: string;
      connectivity: string;
      cpu?: string;
      media?: string;
      memory?: string;
      output?: string;
      graphics?: string;
      sound?: string;
      storage?: string;
      resolutions?: string;
      summary?: string;
      platform_logo?: { image_id: string; url: string; animated?: boolean };
      platform_version_release_dates?: {
        date: number;
        release_region?: { region: string };
      }[];
    }[];
  };

