'use client'

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ApiError, GameData } from '@/lib/types';
import { getGameDetails } from '@/lib/api/igdb';
import { BsBookmark, BsBookmarkCheckFill, BsCollection, BsCollectionFill } from "react-icons/bs";
import PageError from '@/components/PageError';
import PageSkeleton from '@/components/PageSkeleton';
import { useUser } from '@auth0/nextjs-auth0';
import { deleteGame, gameCheck, saveGame } from '@/lib/api/db';
import { toast, Toaster } from 'sonner';
import { formatUnixTime } from '@/lib/utils';
import { FaRegStar, FaStar } from 'react-icons/fa';
import Banner from '@/components/info-pages/Banner';
import InfoList from '@/components/info-pages/InfoList';
import SmallCards from '@/components/info-pages/SmallCards';
import ImagesCarousel from '@/components/ImagesCarousel';
import Videos from '@/components/info-pages/Videos';
import GamesCarousel from '@/components/info-pages/GamesCarousel';
import { outOfOrder, url_igdb_t_original } from '@/lib/constants';

type Mark = "wishlist" | "collected" | null;

export default function GameInfo() {
    const router = useRouter();
    const params = useSearchParams();
    const gameId = params.get("gameId");
    const [gameDetails, setGameDetails] = useState<GameData | null>(null);
    const [bannerBgUrl, setBannerBgUrl] = useState<string>();
    const [mark, setMark] = useState<Mark>(null);
    const [favorite, setFavorite] = useState<boolean>(false);
    const { user } = useUser();
    const [error, setError] = useState<ApiError | null>(null)
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

    const currentPath = `/info/game-info?gameId=${gameId}`;

    useEffect(() => {
        let active = true;

        const run = async () => {
            if (!gameId) {
                if (!active) return;
                setStatus("error");
                setError({ status: 400, code: "BAD_REQUEST", message: "Missing Game ID" })
                return;
            }

            setStatus("loading");
            setGameDetails(null);
            setError(null);

            const result = await getGameDetails(gameId);
            if (!active) return;

            if (result.ok) {
                setGameDetails(result.data);
                setStatus("success");
            } else {
                setError(result.error);
                setStatus("error");
            }
        };

        run();
        return () => { active = false }
    }, [gameId]);

    useEffect(() => {
        if (!gameDetails) return;

        // check if game is in users collection 
        const gameColCheck = async () => {
            // Fetch access token from Auth0
            const tokenResponse = await fetch('/api/auth/token');
            const { accessToken } = await tokenResponse.json();

            const resp = await gameCheck(gameDetails.id, accessToken)

            setFavorite(resp.data.data.favorite);
            if (resp.data.data.collected) setMark("collected");
            else if (resp.data.data.wishlist) setMark("wishlist");
            else setMark(null);
        }
        if (user) gameColCheck();


        if (gameDetails.artworks && gameDetails.artworks.length > 0) {
            setBannerBgUrl(`${url_igdb_t_original}${gameDetails['artworks'][0]['image_id']}.jpg`);
        } else if (gameDetails.screenshots && gameDetails.screenshots?.length > 0) {
            setBannerBgUrl(`${url_igdb_t_original}${gameDetails['screenshots'][0]['image_id']}.jpg`);
        } else setBannerBgUrl("") // TODO:should have a default image here 
    }, [gameDetails])

    const handleMark = async (next: Exclude<Mark, null>) => {
        if (!gameDetails) return;
        if (!user) {
            window.location.href = `/auth/login?returnTo=${encodeURIComponent(currentPath)}`;
            return;
        }

        const prevMark = mark;
        const newMark = mark === next ? null : next;
        setMark(newMark);

        const runMark = (async () => {
            // Fetch access token from Auth0
            const tokenResponse = await fetch('/api/auth/token');
            const { accessToken } = await tokenResponse.json();

            if (mark === next) {
                // delete and set mark to null
                const resp = await deleteGame(gameDetails.id, accessToken)
                if (!resp.ok) throw new Error("Delete Failed!");
                return { action: "deleted from", target: prevMark ?? next }
            } else {
                const resp = await saveGame(gameDetails, accessToken, next === "collected", next === "wishlist");
                if (!resp.ok) throw new Error("Save Failed!");
                return { action: "added to", target: next }

            }
        })();

        toast.promise(runMark, {
            loading: `Adding to ${mark}${mark === "wishlist" ? "'s" : ""}`,
            success: ({ action, target }) => `Game ${action} ${target}${next === "wishlist" ? "'s" : ""}`,
            error: "Failed to update game status"
        });

        try {
            await runMark;
        } catch (error) {
            setMark(prevMark);
        }
    }

    const handleFavorites = async () => {
        if (!gameDetails) return;
        if (!user) {
            window.location.href = `/auth/login?returnTo=${encodeURIComponent(currentPath)}`;
            return;
        }

        const favState = !favorite
        setFavorite(favState);

        const runFav = (async () => {
            // Fetch access token from Auth0 --- TODO: Need to make this happen one time per page for user logged in 
            const tokenResponse = await fetch('/api/auth/token');
            const { accessToken } = await tokenResponse.json();

            if (!favState && mark === null) {
                // delete and set mark to null
                const resp = await deleteGame(gameDetails.id, accessToken)
                if (!resp.ok) throw new Error("Delete Failed!");
                return { action: "removed from", target: "your collection" }
            } else {
                const resp = await saveGame(gameDetails, accessToken, mark === "collected", mark === "wishlist", favState);
                if (!resp.ok) throw new Error("Save Failed!");
                return { action: `${favState ? "added to" : "removed from"}`, target: "favorites" }

            }
        })();

        toast.promise(runFav, {
            loading: `Adding to favorites`,
            success: ({ action, target }) => `Game ${action} ${target}`,
            error: "Failed to update game status"
        });

        try {
            await runFav;
        } catch (error) {
            setFavorite(!favState);
        }
    }

    if (status === "loading") return <PageSkeleton />;
    if (status === "error") return <PageError />;
    // TODO: future change for error page
    // if (status === "error") return <PageError code={error?.code} message={error?.message} />; 

    return (
        <main className="flex w-full flex-col ">
            <Toaster />
            <div className='flex flex-col gap-4 p-4'>
                {/* Banner Image */}
                {bannerBgUrl &&
                    <Banner url={bannerBgUrl} />
                }

                {/* Game Details */}
                <div className='bg-secondary p-3 rounded-xl'>
                    {/* Game Title */}
                    {gameDetails?.name &&
                        <div className='flex justify-between'>
                            <h1 className='ps-6 text-4xl text-center font-bold w-full justify-center flex'>{gameDetails.name}</h1>
                            <div className="flex gap-3 pe-3">
                                <span onClick={() => { handleMark("wishlist") }}>
                                    {mark === "wishlist" ?
                                        <BsBookmarkCheckFill /> : <BsBookmark />
                                    }
                                </span>
                                <span onClick={() => { handleMark("collected") }}>
                                    {mark === "collected" ?
                                        <BsCollectionFill /> : <BsCollection />
                                    }
                                </span>
                                <span onClick={() => { handleFavorites() }}>
                                    {favorite ?
                                        <FaStar /> : <FaRegStar />
                                    }
                                </span>
                            </div>

                        </div>
                    }

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
                        <aside className="col-span-1 flex flex-col gap-4">
                            {/* Cover Image */}
                            {gameDetails?.cover &&
                                <div className='relative h-96 w-full'>
                                    <Image
                                        src={gameDetails.cover?.image_id && gameDetails.cover?.image_id !== undefined ? `${url_igdb_t_original}${gameDetails.cover?.image_id}.jpg` : outOfOrder}
                                        alt={`${gameDetails.name} cover art`}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        className="object-contain"
                                    />
                                </div>
                            }

                            {gameDetails?.rating && (
                                <div>
                                    <strong>Rating:</strong>
                                    {gameDetails.rating.toFixed(2)} ({gameDetails.rating_count} votes)
                                </div>
                            )}
                            {gameDetails?.total_rating && (
                                <div>
                                    <strong>Total Rating:</strong>
                                    {gameDetails.total_rating.toFixed(2)} ({gameDetails.total_rating_count} votes)
                                </div>
                            )}
                            {gameDetails?.first_release_date && (
                                <div>
                                    <strong>Release Date:</strong>
                                    {formatUnixTime(gameDetails.first_release_date)}
                                </div>
                            )}
                            {gameDetails?.game_type?.type && (
                                <div>
                                    <strong>Game Type:</strong>
                                    {gameDetails.game_type.type}
                                </div>
                            )}

                            {/* Franchises */}
                            {gameDetails?.franchises && gameDetails.franchises.length > 0 &&
                                <section>
                                    <strong>Franchises</strong>
                                    <ul className='flex flex-wrap gap-2'>
                                        {gameDetails.franchises.map((franchise) => (
                                            <li key={`franchise-${franchise.id}`} className="bg-background text-secondary-foreground p-2 rounded-lg">{franchise.name}</li>
                                        ))}
                                    </ul>
                                </section>
                            }

                            {/* Involved Companies */}
                            {
                                gameDetails?.involved_companies && gameDetails.involved_companies.length > 0 &&
                                <section>
                                    <strong>Involved Companies</strong>
                                    <ul className='flex flex-wrap gap-2'>
                                        {gameDetails.involved_companies.map((ic) => (
                                            ic.company &&
                                            <li key={`ic-${ic.id}`} className='bg-background px-3 gap-2 rounded-xl' >
                                                {ic.company.name} ({ic.developer ? 'Developer' : ''}{ic.publisher ? 'Publisher' : ''}{ic.porting ? 'Porting' : ''}{ic.supporting ? 'Supporting' : ''})
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            }
                        </aside>

                        <section className="col-span-2 flex flex-col gap-4">
                            {gameDetails?.summary &&
                                <div>
                                    <h2 className="text-2xl font-semibold mb-2">Summary</h2>
                                    <p>{gameDetails.summary}</p>
                                </div>
                            }
                            {gameDetails?.storyline &&
                                <div>
                                    <h2 className="text-2xl font-semibold mb-2">Storyline</h2>
                                    <p>{gameDetails.storyline}</p>
                                </div>
                            }
                            <div className='grid grid-cols-2'>
                                {/* Platforms */}
                                {gameDetails?.platforms && gameDetails.platforms.length > 0 && (
                                    <InfoList title={"Platforms"} items={gameDetails.platforms} />
                                )}

                                {/* Genres */}
                                {gameDetails?.genres && gameDetails.genres.length > 0 && (
                                    <InfoList title={"Genres"} items={gameDetails.genres} />
                                )}

                                {/* Themes */}
                                {gameDetails?.themes && gameDetails.themes.length > 0 && (
                                    <InfoList title={"Themes"} items={gameDetails.themes} />
                                )}

                                {/* Player Perspectives */}
                                {gameDetails?.player_perspectives && gameDetails.player_perspectives.length > 0 && (
                                    <InfoList title={"Player Perspectives"} items={gameDetails.player_perspectives} />
                                )}

                                {/* Game Modes */}
                                {gameDetails?.game_modes && gameDetails.game_modes.length > 0 && (
                                    <InfoList title={'Game Modes'} items={gameDetails.game_modes} />
                                )}
                            </div>

                            {/* DLCs */}
                            {gameDetails?.dlcs && gameDetails.dlcs.length > 0 && (
                                <SmallCards title={'DLCs'} items={gameDetails.dlcs} />
                            )}

                            {/* Bundles */}
                            {gameDetails?.bundles && gameDetails.bundles.length > 0 && (
                                <SmallCards title={'Bundles'} items={gameDetails.bundles} />
                            )}

                            {/* Expanded Games */}
                            {gameDetails?.expanded_games && gameDetails.expanded_games.length > 0 && (
                                <SmallCards title={'Expanded Games'} items={gameDetails.expanded_games} />
                            )}
                        </section>
                    </div>
                </div>

                {/* Screenshots */}
                {gameDetails?.screenshots && gameDetails.screenshots.length > 0 && (
                    <ImagesCarousel title={"Screenshots"} items={gameDetails.screenshots} />
                )}

                {/* Artworks */}
                {gameDetails?.artworks && gameDetails.artworks.length > 0 && (
                    <ImagesCarousel title={"Artworks"} items={gameDetails.artworks} />
                )}

                {/* Videos */}
                {gameDetails?.videos && gameDetails.videos.length > 0 && (
                    <Videos title={"Videos"} items={gameDetails.videos} />
                )}

                {/* Similar Games */}
                {gameDetails?.similar_games && gameDetails.similar_games.length > 0 && (
                    <GamesCarousel title='Similar Games' games={gameDetails.similar_games} moreActive={false} />
                )}

                {/* Websites */}
                {gameDetails?.websites && gameDetails.websites.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-semibold mb-2">Related Websites</h2>
                        <ul className='flex flex-wrap gap-2'>
                            {gameDetails.websites.map((site, index) => (
                                site.url && site.type &&
                                <li key={`site-${site.id}`}>
                                    <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                        {site.type.type}
                                    </a>
                                    {gameDetails.websites && index < gameDetails.websites.length - 1 && " |"}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

            </div >
        </main >
    )
}
