'use client'

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ApiError, GameData } from '@/lib/types';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getGameDetails } from '@/lib/api/igdb';
import { BsBookmark, BsBookmarkCheckFill, BsCollection, BsCollectionFill } from "react-icons/bs";
import { CiStar } from "react-icons/ci";
import PageError from '@/components/PageError';
import PageSkeleton from '@/components/PageSkeleton';
import { useUser } from '@auth0/nextjs-auth0';
import { deleteGame, gameCheck, saveGame } from '@/lib/api/db';
import { toast, Toaster } from 'sonner';
import { formatUnixTime } from '@/lib/utils';
import { FaRegStar, FaStar } from 'react-icons/fa';


const url_igdb_t_original = process.env.NEXT_PUBLIC_URL_IGDB_T_ORIGINAL;
const outOfOrder = '/imgs/out-of-order.jpg'

type Mark = "wishlist" | "collected" | null;

export default function GameInfo() {
    const router = useRouter();
    const params = useSearchParams();
    const gameId = params.get("gameId");
    const [gameDetails, setGameDetails] = useState<GameData | null>(null);
    const [bannerBgUrl, setBannerBgUrl] = useState<string>();
    const [selectedImg, setSelectedImg] = useState<string | null>("");
    const [mark, setMark] = useState<Mark>(null);
    const [favorite, setFavorite] = useState<boolean>(false);
    const { user } = useUser();
    const [error, setError] = useState<ApiError | null>(null)
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

    const currentPath = `/game-info?gameId=${gameId}`;


    useEffect(() => {
        let active = true;

        const run = async () => {
            if (!gameId) {
                if (!active) return;
                setStatus("error");
                setError({ status: 400, code: "BAD_REQUEST", message: "Missing GameId" })
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
        

        if (gameDetails.artworks?.length > 0) {
            setBannerBgUrl(`${url_igdb_t_original}${gameDetails['artworks'][0]['image_id']}.jpg`);
        } else if (gameDetails.screenshots?.length > 0) {
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

        const fun = (async () => {
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

        toast.promise(fun, {
            loading: `Adding to ${mark}${mark === "wishlist" ? "'s" : ""}`,
            success: ({ action, target }) => `Game ${action} ${target}${next === "wishlist" ? "'s" : ""}`,
            error: "Failed to update game status"
        });

        try {
            await fun;
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

        const fun = (async () => {
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

        toast.promise(fun, {
            loading: `Adding to favorites`,
            success: ({ action, target }) => `Game ${action} ${target}`,
            error: "Failed to update game status"
        });

        try {
            await fun;
        } catch (error) {
            setFavorite(!favState);
        }
    }

    const goToDifferentGame = (id: number) => {
        // setLoading(true);
        router.push(`/game-info?gameId=${id}`)
    }

    if (status === "loading") return <PageSkeleton />;
    if (status === "error") return <PageError />;
    // TODO: future change for error page
    // if (status === "error") return <PageError code={error?.code} message={error?.message} />; 

    return (
        <div className="flex grow items-center justify-center font-sans bg-background text-foreground">
            <main className="flex min-h-screen w-full flex-col items-center bg-card text-card-foreground sm:items-start">
                <Toaster />
                <div className='flex flex-col gap-4 p-4'>
                    {/* Banner Image */}
                    {bannerBgUrl &&
                        <div
                            className={`flex w-full p-4 bg-cover bg-center justify-center rounded-lg`}
                            style={{
                                backgroundImage: `url("${bannerBgUrl}")`,
                                minHeight: '300px'
                            }}
                        ></div>
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
                                            src={`${url_igdb_t_original}${gameDetails.cover?.image_id}.jpg`}
                                            alt={`${gameDetails.name} cover art`}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            className="object-contain"
                                        />
                                    </div>
                                }

                                {gameDetails?.rating && <div><strong>Rating:</strong> {gameDetails.rating.toFixed(2)} ({gameDetails.rating_count} votes)</div>}
                                {gameDetails?.total_rating && <div><strong>Total Rating:</strong> {gameDetails.total_rating.toFixed(2)} ({gameDetails.total_rating_count} votes)</div>}
                                {gameDetails?.first_release_date && <div><strong>Release Date:</strong> {formatUnixTime(gameDetails.first_release_date)}</div>}
                                {gameDetails?.game_type?.type && <div><strong>Game Type:</strong> {gameDetails.game_type.type}</div>}
                                {/* Franchises */}
                                {
                                    gameDetails?.franchises && gameDetails.franchises.length > 0 &&
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
                                    {
                                        gameDetails?.platforms && gameDetails.platforms.length > 0 &&
                                        <section>
                                            <h4 className="text-2xl font-semibold mb-2">Platforms</h4>
                                            <ul className='flex flex-wrap gap-2'>
                                                {gameDetails.platforms.map((platform) => (
                                                    <li
                                                        key={`platform-${platform.id}`}
                                                        className="bg-background text-secondary-foreground p-2 rounded-lg text-sm"
                                                    >
                                                        {platform.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        </section>
                                    }

                                    {/* Genres */}
                                    {
                                        gameDetails?.genres && gameDetails.genres.length > 0 &&
                                        <section>
                                            <h4 className="text-2xl font-semibold mb-2">Genres</h4>
                                            <ul className='flex flex-wrap gap-2'>
                                                {gameDetails.genres.map((genre) => (
                                                    <li
                                                        key={`genre-${genre.id}`}
                                                        className="bg-background text-secondary-foreground p-2 rounded-lg text-sm"
                                                    >
                                                        {genre.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        </section>
                                    }

                                    {/* Themes */}
                                    {
                                        gameDetails?.themes && gameDetails.themes.length > 0 &&
                                        <section>
                                            <h4 className="text-2xl font-semibold mb-2">Themes</h4>
                                            <ul className='flex flex-wrap gap-2'>
                                                {gameDetails.themes.map((theme) => (
                                                    <li
                                                        key={`theme-${theme.id}`}
                                                        className="bg-background text-secondary-foreground p-2 rounded-lg text-sm"
                                                    >
                                                        {theme.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        </section>
                                    }

                                    {/* Player Perspectives */}
                                    {
                                        gameDetails?.player_perspectives && gameDetails.player_perspectives.length > 0 &&
                                        <section>
                                            <h4 className="text-2xl font-semibold mb-2">Player Perspectives</h4>
                                            <ul className='flex flex-wrap gap-2'>
                                                {gameDetails.player_perspectives.map((perspective) => (
                                                    <li
                                                        key={`perspective-${perspective.id}`}
                                                        className="bg-background text-secondary-foreground p-2 rounded-lg text-sm"
                                                    >
                                                        {perspective.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        </section>
                                    }

                                    {/* Game Modes */}
                                    {
                                        gameDetails?.game_modes && gameDetails.game_modes.length > 0 &&
                                        <section>
                                            <h4 className="text-2xl font-semibold mb-2">Game Modes</h4>
                                            <ul className='flex flex-wrap gap-2'>
                                                {gameDetails.game_modes.map((mode) => (
                                                    <li
                                                        key={`mode-${mode.id}`}
                                                        className="bg-background text-secondary-foreground p-2 rounded-lg text-sm"
                                                    >
                                                        {mode.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        </section>
                                    }



                                </div>

                                {/* DLCs */}
                                {
                                    gameDetails?.dlcs && gameDetails.dlcs.length > 0 && (
                                        <section>
                                            <h4 className="text-2xl font-semibold mb-2">DLCs</h4>
                                            <ul className='flex flex-wrap gap-2'>
                                                {gameDetails.dlcs.map((dlc) => (
                                                    <li
                                                        key={`dlc-${dlc.id}`}
                                                        className="bg-background text-secondary-foreground p-2 rounded-lg w-30 cursor-pointer"
                                                        onClick={() => goToDifferentGame(dlc.id)}
                                                    >
                                                        <div className='relative aspect-square'>
                                                            <Image
                                                                src={dlc.cover && dlc.cover?.image_id ? `${url_igdb_t_original}${dlc.cover?.image_id}.jpg` : outOfOrder}
                                                                alt={`cover-${dlc.id}`}
                                                                fill
                                                                sizes="120px"
                                                                className="rounded-lg"
                                                            />
                                                        </div>
                                                        <span>{dlc.name}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </section>
                                    )
                                }

                                {/* Bundles */}
                                {
                                    gameDetails?.bundles && gameDetails.bundles.length > 0 && (
                                        <section>
                                            <h4 className="text-2xl font-semibold mb-2">Bundles</h4>
                                            <ul className='flex flex-wrap gap-2'>
                                                {gameDetails.bundles.map((bundle) => (
                                                    <li
                                                        key={`bundle-${bundle.id}`}
                                                        className="bg-background text-secondary-foreground p-2 rounded-lg w-30 cursor-pointer"
                                                        onClick={() => goToDifferentGame(bundle.id)}
                                                    >
                                                        <div className={`relative aspect-square`}>
                                                            <Image
                                                                src={`${url_igdb_t_original}${bundle.cover?.image_id}.jpg`}
                                                                alt={`expanded-game-cover-${bundle.id}`}
                                                                fill
                                                                sizes="120px"
                                                                className="rounded-lg"
                                                            />
                                                        </div>
                                                        <span>{bundle.name}</span>

                                                    </li>
                                                ))}
                                            </ul>
                                        </section>
                                    )
                                }

                                {/* Expanded Games */}
                                {
                                    gameDetails?.expanded_games && gameDetails.expanded_games.length > 0 && (
                                        <section>
                                            <h4 className="text-2xl font-semibold mb-2">Expanded Games</h4>
                                            <ul className='flex flex-wrap gap-2'>
                                                {gameDetails.expanded_games.map((game) => (
                                                    game.cover &&
                                                    <li
                                                        key={`expanded-game-${game.id}`}
                                                        className="bg-background text-secondary-foreground p-2 rounded-lg w-30 cursor-pointer"
                                                        onClick={() => goToDifferentGame(game.id)}
                                                    >
                                                        <div className={`relative aspect-square`}>
                                                            <Image
                                                                src={`${url_igdb_t_original}${game.cover?.image_id}.jpg`}
                                                                alt={`expanded-game-cover-${game.id}`}
                                                                fill
                                                                sizes="120px"
                                                                className="rounded-lg"
                                                            />
                                                        </div>
                                                        <span>{game.name}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </section>
                                    )
                                }
                            </section>
                        </div>
                    </div>
                    <Dialog open={!!selectedImg} onOpenChange={(open) => { if (!open) setSelectedImg(null); }}>
                        <DialogTrigger asChild>
                            {/* <Button variant="outline">screenshot test</Button> */}
                        </DialogTrigger>
                        <DialogContent
                            showCloseButton={false}
                            className="bg-transparent border-none shadow-none p-0 flex items-center justify-center w-[95vw] h-[60vh]  lg:max-w-6xl"
                        >
                            <DialogHeader className="hidden">
                                <DialogTitle>
                                    Game Image
                                </DialogTitle>
                            </DialogHeader>
                            <div className="relative w-full h-full">
                                {selectedImg &&
                                    <Image
                                        src={selectedImg}
                                        alt="image"
                                        fill
                                        sizes="95vw"
                                        className="object-contain rounded-lg"
                                    />
                                }
                            </div>
                        </DialogContent>
                    </Dialog>


                    {/* Screenshots */}
                    {gameDetails?.screenshots && gameDetails.screenshots.length > 0 &&
                        <section className='w-full'>
                            <h2 className="text-2xl font-semibold mb-2">Screenshots</h2>
                            <div className='flex justify-center'>
                                <Carousel className="w-full max-w-76 sm:max-w-xs md:max-w-sm xl:max-w-6xl">
                                    <CarouselContent className="-ml-1">
                                        {gameDetails.screenshots.map((ss, index) => (
                                            <CarouselItem key={index} className="basis-1/2 pl-1 lg:basis-1/3">
                                                <div className="p-1" onClick={() => { setSelectedImg(`${url_igdb_t_original}${ss.image_id}.jpg`) }}>
                                                    <Card
                                                        className="relative aspect-video"
                                                    >
                                                        <Image
                                                            src={`${url_igdb_t_original}${ss.image_id}.jpg`}
                                                            alt={`screenshot-${ss.id}`}
                                                            fill
                                                            sizes="(max-width: 1024px) 50vw, 33vw"
                                                            className="object-cover rounded-lg"
                                                        />
                                                    </Card>
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious />
                                    <CarouselNext />
                                </Carousel>
                            </div>
                        </section>
                    }




                    {/* Artworks */}
                    {
                        gameDetails?.artworks && gameDetails.artworks.length > 0 &&
                        <section className='w-full'>
                            <h2 className="text-2xl font-semibold mb-2">Artworks</h2>

                            <div className='flex justify-center'>
                                <Carousel className="w-full max-w-76 sm:max-w-xs md:max-w-sm xl:max-w-6xl">
                                    <CarouselContent className="-ml-1">
                                        {gameDetails.artworks.map((art, index) => (
                                            <CarouselItem key={index} className="basis-1/2 pl-1 lg:basis-1/3">
                                                <div className="p-1" onClick={() => { setSelectedImg(`${url_igdb_t_original}${art.image_id}.jpg`) }}>
                                                    <Card
                                                        className="relative aspect-video"
                                                    >
                                                        <Image
                                                            src={`${url_igdb_t_original}${art.image_id}.jpg`}
                                                            alt={`screenshot-${art.id}`}
                                                            fill
                                                            sizes="(max-width: 1024px) 50vw, 33vw"
                                                            className="object-cover rounded-lg"
                                                        />
                                                    </Card>
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious />
                                    <CarouselNext />
                                </Carousel>
                            </div>
                        </section>
                    }

                    {/* Videos */}
                    {
                        gameDetails?.videos && gameDetails.videos.length > 0 &&
                        <section>
                            <h2 className="text-2xl font-semibold mb-2">Videos</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {gameDetails.videos.map((video) => (
                                    <div key={`video-${video.id}`}>
                                        <h3 className="font-bold">{video.name}</h3>
                                        <iframe
                                            width="100%"
                                            height="315"
                                            src={`https://www.youtube.com/embed/${video.video_id}`}
                                            title={video.name}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="rounded-lg"
                                        ></iframe>
                                    </div>
                                ))}
                            </div>
                        </section>
                    }

                    {/* Similar Games */}
                    {
                        gameDetails?.similar_games && gameDetails.similar_games.length > 0 &&
                        <section className='w-full'>
                            <h2 className="text-2xl font-semibold mb-2">Similar Games</h2>
                            <div className='flex justify-center'>
                                <Carousel className="w-full max-w-76 sm:max-w-xs md:max-w-sm xl:max-w-6xl">
                                    <CarouselContent className="-ml-1">
                                        {gameDetails.similar_games.map((game, index) => (
                                            <CarouselItem key={index} className="basis-1/2 pl-1 lg:basis-1/5 cursor-pointer">
                                                <div
                                                    className="p-1"
                                                    onClick={() => goToDifferentGame(game.id)}
                                                >
                                                    <Card className="relative aspect-3/4" >
                                                        <Image
                                                            src={`${url_igdb_t_original}${game.cover?.image_id}.jpg`}
                                                            alt={`screenshot-${game.id}`}
                                                            fill
                                                            sizes="(max-width: 1024px) 50vw, 20vw"
                                                            className="object-cover rounded-lg"
                                                        />
                                                    </Card>
                                                    <div className='w-full flex justify-center'>
                                                        <p>{game.name}</p>
                                                    </div>
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious />
                                    <CarouselNext />
                                </Carousel>
                            </div>
                        </section>

                    }

                    {/* Websites */}
                    {
                        gameDetails?.websites && gameDetails.websites.length > 0 &&
                        <section>
                            <h2 className="text-2xl font-semibold mb-2">Related Websites</h2>
                            <ul className='flex flex-wrap gap-2'>
                                {gameDetails.websites.map((site, index) => (
                                    site.url && site.type &&
                                    <li key={`site-${site.id}`}>
                                        <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                            {site.type.type}
                                        </a>
                                        {index < gameDetails.websites.length - 1 && " |"}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    }

                </div >
            </main >
        </div >
    )
}
