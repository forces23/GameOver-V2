'use client'

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ApiError, GameData, Mark } from '@/lib/types';
import { getGameDetails } from '@/lib/api/igdb';
import { BsBookmark, BsBookmarkCheckFill, BsCollection, BsCollectionFill } from "react-icons/bs";
import PageError from '@/components/PageError';
import { useUser } from '@auth0/nextjs-auth0';
import { deleteGame, gameCheck, saveGame } from '@/lib/api/db';
import { toast, Toaster } from 'sonner';
import { FaRegStar, FaStar } from 'react-icons/fa';
import Banner from '@/components/info-pages/Banner';
import GamesCarousel from '@/components/info-pages/GamesCarousel';
import { outOfOrder, url_igdb_t_original } from '@/lib/constants';
import CollectedGamesDetails from '@/components/info-pages/CollectedGamesDetails';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FaPaintBrush } from "react-icons/fa";
import { RiVideoFill } from "react-icons/ri";
import { GrMultiple } from "react-icons/gr";
import { ImBoxAdd } from "react-icons/im";
import { FaImage } from "react-icons/fa6"; import { GrOverview } from "react-icons/gr";
import { GiExpander } from "react-icons/gi";
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Overview from '@/components/info-pages/game-info/overview';
import DLCs from '@/components/info-pages/game-info/DLCs';
import Bundles from '@/components/info-pages/game-info/Bundles';
import ExpandedGames from '@/components/info-pages/game-info/ExpandedGames';
import Screenshots from '@/components/info-pages/game-info/Screenshots';
import Artwork from '@/components/info-pages/game-info/Artwork';
import Videos from '@/components/info-pages/game-info/Videos';
import UserCollection from '@/components/info-pages/game-info/UserCollection';
import NetworkIcon from '@/components/NetworkIcon';
import AnimatedLoading from '@/components/AnimatedLoading';




export default function GameInfo() {
    const router = useRouter();
    const params = useSearchParams();
    const gameId = params.get("gameId");
    const [gameDetails, setGameDetails] = useState<GameData | null>(null);
    const [bannerBgUrl, setBannerBgUrl] = useState<string>();
    const [mark, setMark] = useState<Mark>(null);
    const [prevMark, setPrevMark] = useState<Mark>(null);
    const { user } = useUser();
    const [error, setError] = useState<ApiError | null>(null)
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [extraDetailOpen, setExtraDetailsOpen] = useState<boolean>(false);
    const [favorite, setFavorite] = useState<boolean>(false);
    const [tabView, setTabView] = useState<string>("overview");
    const [userGameData, setUserGameData] = useState<any>()

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


    const userGameDataRefresh = () => {
        if (!gameDetails) return;

        // check if game is in users collection 
        const gameColCheck = async () => {
            // Fetch access token from Auth0
            const tokenResponse = await fetch('/api/auth/token');
            const { accessToken } = await tokenResponse.json();

            const resp = await gameCheck(gameDetails.id, accessToken);

            setUserGameData(resp.data.data)
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
    }

    useEffect(() => {
        if (!gameDetails) return;
        userGameDataRefresh();
    }, [gameDetails])

    const saveToWishlist = async () => {
        if (!gameDetails) return;
        if (!user) {
            window.location.href = `/auth/login?returnTo=${encodeURIComponent(currentPath)}`;
            return;
        }

        const runWishlist = (async () => {
            // Fetch access token from Auth0
            const tokenResponse = await fetch('/api/auth/token');
            const { accessToken } = await tokenResponse.json();

            const resp = await saveGame(gameDetails, null, accessToken, false, true);
            if (!resp.ok) throw new Error("Save Failed!");
            return { action: "added to", target: "wishlist" }
        })();

        toast.promise(runWishlist, {
            loading: `Adding to wishlist`,
            success: ({ action, target }) => `Game ${action} ${target}`,
            error: "Failed to add game to wishlist"
        });

        try {
            await runWishlist;
        } catch (error) {
            // TODO: DO SOMETHING
        }
    }

    const deleteFromCollection = async () => {
        if (!gameDetails) return;
        if (!user) {
            window.location.href = `/auth/login?returnTo=${encodeURIComponent(currentPath)}`;
            return;
        }

        const run = (async () => {
            // Fetch access token from Auth0
            const tokenResponse = await fetch('/api/auth/token');
            const { accessToken } = await tokenResponse.json();

            // delete from collection
            const resp = await deleteGame(gameDetails.id, accessToken)
            if (!resp.ok) throw new Error("Delete Failed!");
            return { action: "removed from", target: mark }
        })();

        toast.promise(run, {
            loading: `Removing game`,
            success: ({ action, target }) => `Game ${action} ${target}`,
            error: `Failed remove game`
        });

        try {
            await run;
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
                deleteFromCollection();
                return { action: "removed from", target: "your collection" }
            } else {
                const resp = await saveGame(gameDetails, null, accessToken, mark === "collected", mark === "wishlist", favState);
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

    const handleSave = (next: Exclude<Mark, null>) => {
        setPrevMark(mark);
        const newMark = (mark === next ? null : next);
        setMark(newMark);

        if (newMark === "collected") {
            setExtraDetailsOpen(true);
        } else if (newMark === "wishlist") {
            saveToWishlist();
        } else {
            deleteFromCollection();
            // userGameDataRefresh();
            setTabView("overview");
        }
    }

    if (status === "loading") return <AnimatedLoading />;
    if (status === "error") return <PageError />;
    // TODO: future change for error page
    // if (status === "error") return <PageError code={error?.code} message={error?.message} />; 

    return (
        <main className="flex flex-col">
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
                            <h1 className='ps-6 text-4xl text-center font-bold w-full justify-center flex'>
                                {gameDetails.name}
                            </h1>
                            <div className='flex flex-col gap-3'>
                                <div className="flex justify-center gap-3 pe-3">
                                    <span
                                        onClick={() => { handleSave("wishlist") }}
                                        className='md:text-2xl'>
                                        {mark === "wishlist" ?
                                            <BsBookmarkCheckFill /> : <BsBookmark />
                                        }
                                    </span>
                                    <span
                                        onClick={() => { handleSave("collected") }}
                                        className='md:text-2xl'>
                                        {mark === "collected" ?
                                            <BsCollectionFill /> : <BsCollection />
                                        }
                                    </span>
                                    <span onClick={() => { mark === "collected" && handleFavorites() }} className='md:text-2xl'>
                                        {favorite ?
                                            <FaStar /> : <FaRegStar />
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    }

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
                        <aside className="col-span-1 flex flex-col gap-4">
                            {/* Cover Image */}
                            {gameDetails?.cover &&
                                <div className='relative h-100 w-full'>
                                    <Image
                                        src={gameDetails.cover?.image_id && gameDetails.cover?.image_id !== undefined ? `${url_igdb_t_original}${gameDetails.cover?.image_id}.jpg` : outOfOrder}
                                        alt={`${gameDetails.name} cover art`}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        className="object-contain"
                                    />
                                </div>
                            }
                            {/* Websites */}
                            {gameDetails?.websites && gameDetails.websites.length > 0 && (
                                <section className='w-full flex items-center justify-center'>
                                    <div className='max-w-sm flex flex-col items-center justify-center'>
                                        <h4 className="text-2xl font-semibold mb-2">Related Websites</h4>
                                        <ul className='flex flex-wrap gap-3'>
                                            {gameDetails.websites.map((site, index) => (
                                                site.url && site.type &&
                                                <li key={`site-${site.id}`}>
                                                    <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                                        <NetworkIcon url={site.url} />
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </section>
                            )}
                        </aside>

                        <section className="col-span-2 flex flex-col gap-4">
                            <div className='md:hidden'>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className='w-full'>
                                            <div className="w-full flex items-center justify-center">
                                                Menu
                                            </div>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="start"
                                        className="w-[var(--radix-dropdown-menu-trigger-width)]"
                                    >
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem onClick={() => setTabView("overview")}>
                                                <GrOverview />Overview
                                            </DropdownMenuItem>
                                            {mark === "collected" && (
                                                <DropdownMenuItem onClick={() => setTabView("user-collection")}>
                                                    <BsCollectionFill />Your Collection
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem onClick={() => setTabView("dlcs")}>
                                                <ImBoxAdd />DLCs
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setTabView("bundles")}>
                                                <GrMultiple />Bundles
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setTabView("expanded-games")}>
                                                <GiExpander />Expanded Games
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setTabView("screenshots")}>
                                                <FaImage />Screenshots
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setTabView("artwork")}>
                                                <FaPaintBrush />Artwork
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setTabView("videos")}>
                                                <RiVideoFill />Videos
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <Tabs value={tabView} onValueChange={setTabView} defaultValue="overview" className='hidden md:flex'>
                                <TabsList variant="line">
                                    <TabsTrigger value="overview"><GrOverview />Overview</TabsTrigger>
                                    {mark === "collected" && (
                                        <TabsTrigger value="user-collection"><BsCollectionFill />Your Collection</TabsTrigger>
                                    )}
                                    <TabsTrigger value="dlcs"><ImBoxAdd />DLCs</TabsTrigger>
                                    <TabsTrigger value="bundles"><GrMultiple />Bundles</TabsTrigger>
                                    <TabsTrigger value="expanded-games"><GiExpander />Expanded Games</TabsTrigger>
                                    <TabsTrigger value="screenshots"><FaImage />Screenshots</TabsTrigger>
                                    <TabsTrigger value="artworks"><FaPaintBrush />Artwork</TabsTrigger>
                                    <TabsTrigger value="videos"><RiVideoFill />Videos</TabsTrigger>
                                </TabsList>
                            </Tabs>

                            {gameDetails && tabView === "overview" && (
                                <Overview gameDetails={gameDetails} />
                            )}

                            {gameDetails && tabView === "user-collection" && (
                                <UserCollection userGameData={userGameData} refreshPage={userGameDataRefresh} />
                            )}

                            {gameDetails?.dlcs && tabView === "dlcs" && (
                                <DLCs gameDetails={gameDetails} smallScreenOnlyTitle={true} />
                            )}

                            {gameDetails?.bundles && tabView === "bundles" && (
                                <Bundles gameDetails={gameDetails} smallScreenOnlyTitle={true} />
                            )}

                            {gameDetails?.expanded_games && tabView === "expanded-games" && (
                                <ExpandedGames gameDetails={gameDetails} smallScreenOnlyTitle={true} />
                            )}


                            {gameDetails?.screenshots && tabView === "screenshots" && (
                                <Screenshots gameDetails={gameDetails} smallScreenOnlyTitle={true} />
                            )}

                            {gameDetails?.artworks && tabView === "artworks" && (
                                <Artwork gameDetails={gameDetails} smallScreenOnlyTitle={true} />
                            )}

                            {gameDetails?.videos && tabView === "videos" && (
                                <Videos gameDetails={gameDetails} smallScreenOnlyTitle={true} />
                            )}
                        </section>


                    </div>
                </div>

                {/* Similar Games */}
                {gameDetails?.similar_games && gameDetails.similar_games.length > 0 && (
                    <GamesCarousel title='Similar Games' games={gameDetails.similar_games} moreActive={false} />
                )}

            </div >
            {/* EXTRA DETAILS DIALOG */}
            <CollectedGamesDetails
                open={extraDetailOpen}
                setOpen={setExtraDetailsOpen}
                // mark={mark}
                // setMark={setMark}
                // prevMark={prevMark}
                mode="create"
                gameDetails={gameDetails}
                onSaved={userGameDataRefresh}
            />
        </main >
    )
}
