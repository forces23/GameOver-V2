'use client'

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { GameData } from '@/lib/types';
import { formatUnixTime } from '@/utils/utils';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { getGameDetails } from '@/lib/api/igdb';
import { BsBookmark, BsBookmarkCheckFill, BsCollection, BsCollectionFill } from "react-icons/bs";
import PageError from '@/components/PageError';
import PageSkeleton from '@/components/PageSkeleton';
import { useUser } from '@auth0/nextjs-auth0';
import { saveGame } from '@/lib/api/db';

const url_igdb_t_original = process.env.NEXT_PUBLIC_URL_IGDB_T_ORIGINAL;
const outOfOrder = '/imgs/out-of-order.jpg'

type Mark = "want" | "collected" | null;

export default function GameInfo() {
    const router = useRouter();
    const params = useSearchParams();
    const gameId = params.get("gameId");
    const [gameDetails, setGameDetails] = useState<GameData>();
    const [bannerBgUrl, setBannerBgUrl] = useState<string>();
    const [selectedImg, setSelectedImg] = useState<string | null>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [mark, setMark] = useState<Mark>(null);
    const [saving, setSaving] = useState<boolean>(false);
    const { user } = useUser();
    const currentPath = `/game-info?gameId=${gameId}`;


    useEffect(() => {
        setGameDetails(undefined);

        const fetchGameDetails = async () => {
            if (!gameId) return;

            const data = await getGameDetails(gameId);
            setGameDetails(data);
            setBanner(data);
            setLoading(false);
        }
        fetchGameDetails();
    }, [gameId]);

    const handleMark = async (next: Exclude<Mark, null>) => {
        if (!gameDetails) return;
        if (!user) {
            window.location.href = `/auth/login?returnTo=${encodeURIComponent(currentPath)}`;
            return;
        } else {
            const newMark = mark === next ? null : next; // optional toggle off
            setMark(newMark); // Optimistic UI
            setSaving(true);
            try {
                // Fetch access token from Auth0
                const tokenResponse = await fetch('/api/auth/token');
                const { accessToken } = await tokenResponse.json();

                // Pass token to saveGame
                await saveGame(gameDetails, newMark === "collected", newMark === "want", accessToken);
            } catch (error) {
                console.error("Error saving game:", error);
                setSaving(false);
                setMark(null);
            }
        }
    }



    const setBanner = (data: GameData | undefined) => {
        if (gameDetails) {
            if (gameDetails.artworks?.length > 0) {
                setBannerBgUrl(`${url_igdb_t_original}${gameDetails['artworks'][0]['image_id']}.jpg`);
            } else if (gameDetails.screenshots?.length > 0) {
                setBannerBgUrl(`${url_igdb_t_original}${gameDetails['screenshots'][0]['image_id']}.jpg`);
            } else setBannerBgUrl("")
        }
    }

    if (loading) return <PageSkeleton />;
    if (!gameDetails) return <PageError />;

    return (
        <div className="flex min-h-screen items-center justify-center font-sans bg-background text-foreground">
            <main className="flex min-h-screen w-full flex-col items-center bg-card text-card-foreground sm:items-start">
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
                        {gameDetails.name &&
                            <div className='flex justify-between'>
                                <h1 className='ps-6 text-4xl font-bold w-full justify-center flex'>{gameDetails.name}</h1>
                                <div className="flex gap-3 pe-3">
                                    <span onClick={() => { handleMark("want") }}>
                                        {mark === "want" ?
                                            <BsBookmarkCheckFill /> : <BsBookmark />
                                        }
                                    </span>
                                    <span onClick={() => { handleMark("collected") }}>
                                        {mark === "collected" ?
                                            <BsCollectionFill /> : <BsCollection />
                                        }
                                    </span>
                                </div>

                            </div>
                        }

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
                            <aside className="col-span-1 flex flex-col gap-4">
                                {/* Cover Image */}
                                {gameDetails.cover &&
                                    <div className='relative h-96 w-full'>
                                        <Image
                                            src={`${url_igdb_t_original}${gameDetails.cover?.image_id}.jpg`}
                                            alt={`${gameDetails.name} cover art`}
                                            layout="fill"
                                            objectFit="contain"
                                        // className="rounded-xl"
                                        />
                                    </div>
                                }

                                {gameDetails.rating && <div><strong>Rating:</strong> {gameDetails.rating.toFixed(2)} ({gameDetails.rating_count} votes)</div>}
                                {gameDetails.total_rating && <div><strong>Total Rating:</strong> {gameDetails.total_rating.toFixed(2)} ({gameDetails.total_rating_count} votes)</div>}
                                {gameDetails.first_release_date && <div><strong>Release Date:</strong> {formatUnixTime(gameDetails.first_release_date)}</div>}
                                {gameDetails.game_type?.type && <div><strong>Game Type:</strong> {gameDetails.game_type.type}</div>}
                                {/* Franchises */}
                                {
                                    gameDetails.franchises && gameDetails.franchises.length > 0 &&
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
                                    gameDetails.involved_companies && gameDetails.involved_companies.length > 0 &&
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
                                {gameDetails.summary &&
                                    <div>
                                        <h2 className="text-2xl font-semibold mb-2">Summary</h2>
                                        <p>{gameDetails.summary}</p>
                                    </div>
                                }
                                {gameDetails.storyline &&
                                    <div>
                                        <h2 className="text-2xl font-semibold mb-2">Storyline</h2>
                                        <p>{gameDetails.storyline}</p>
                                    </div>
                                }
                                <div className='grid grid-cols-2'>
                                    {/* Platforms */}
                                    {
                                        gameDetails.platforms && gameDetails.platforms.length > 0 &&
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
                                        gameDetails.genres && gameDetails.genres.length > 0 &&
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
                                        gameDetails.themes && gameDetails.themes.length > 0 &&
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
                                        gameDetails.player_perspectives && gameDetails.player_perspectives.length > 0 &&
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
                                        gameDetails.game_modes && gameDetails.game_modes.length > 0 &&
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
                                    gameDetails.dlcs && gameDetails.dlcs.length > 0 && (
                                        <section>
                                            <h4 className="text-2xl font-semibold mb-2">DLCs</h4>
                                            <ul className='flex flex-wrap gap-2'>
                                                {gameDetails.dlcs.map((dlc) => (
                                                    <li
                                                        key={`dlc-${dlc.id}`}
                                                        className="bg-background text-secondary-foreground p-2 rounded-lg w-30 cursor-pointer"
                                                        onClick={() => { router.push(`/game-info?gameId=${dlc.id}`) }}
                                                    >
                                                        <div className='relative aspect-square'>
                                                            <Image
                                                                src={dlc.cover && dlc.cover?.image_id ? `${url_igdb_t_original}${dlc.cover?.image_id}.jpg` : outOfOrder}
                                                                alt={`cover-${dlc.id}`}
                                                                layout="fill"
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
                                    gameDetails.bundles && gameDetails.bundles.length > 0 && (
                                        <section>
                                            <h4 className="text-2xl font-semibold mb-2">Bundles</h4>
                                            <ul className='flex flex-wrap gap-2'>
                                                {gameDetails.bundles.map((bundle) => (
                                                    <li
                                                        key={`bundle-${bundle.id}`}
                                                        className="bg-background text-secondary-foreground p-2 rounded-lg w-30 cursor-pointer"
                                                        onClick={() => { router.push(`/game-info?gameId=${bundle.id}`) }}
                                                    >
                                                        <div className={`relative aspect-square`}>
                                                            <Image
                                                                src={`${url_igdb_t_original}${bundle.cover?.image_id}.jpg`}
                                                                alt={`expanded-game-cover-${bundle.id}`}
                                                                layout="fill"
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
                                    gameDetails.expanded_games && gameDetails.expanded_games.length > 0 && (
                                        <section>
                                            <h4 className="text-2xl font-semibold mb-2">Expanded Games</h4>
                                            <ul className='flex flex-wrap gap-2'>
                                                {gameDetails.expanded_games.map((game) => (
                                                    game.cover &&
                                                    <li
                                                        key={`expanded-game-${game.id}`}
                                                        className="bg-background text-secondary-foreground p-2 rounded-lg w-30 cursor-pointer"
                                                        onClick={() => { router.push(`/game-info?gameId=${game.id}`) }}
                                                    >
                                                        <div className={`relative aspect-square`}>
                                                            <Image
                                                                src={`${url_igdb_t_original}${game.cover?.image_id}.jpg`}
                                                                alt={`expanded-game-cover-${game.id}`}
                                                                layout="fill"
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
                            className="bg-transparent border-none shadow-none p-0 flex items-center justify-center w-[95vw] h-[95vh] md:w-[80vw] md:h-[90vh] lg:max-w-6xl"
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
                                        className="object-contain rounded-lg"
                                    />
                                }
                            </div>
                        </DialogContent>
                    </Dialog>


                    {/* Screenshots */}
                    {gameDetails.screenshots && gameDetails.screenshots.length > 0 &&
                        <section className='w-full'>
                            <h2 className="text-2xl font-semibold mb-2">Screenshots</h2>
                            <div className='flex justify-center'>
                                <Carousel className="w-full max-w-76 sm:max-w-xs md:max-w-sm xl:max-w-6xl">
                                    <CarouselContent className="-ml-1">
                                        {gameDetails.screenshots.map((ss, index) => (
                                            <CarouselItem key={index} className="basis-1/2 pl-1 lg:basis-1/3">
                                                <div className="p-1" onClick={() => { setSelectedImg(`${url_igdb_t_original}${ss.image_id}.jpg`) }}>
                                                    <Card
                                                        className="relative"
                                                    >
                                                        <CardContent className='aspect-video'>
                                                            <Image
                                                                src={`${url_igdb_t_original}${ss.image_id}.jpg`}
                                                                alt={`screenshot-${ss.id}`}
                                                                layout="fill"
                                                                objectFit="cover"
                                                                className="rounded-lg"
                                                            />
                                                        </CardContent>
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
                        gameDetails.artworks && gameDetails.artworks.length > 0 &&
                        <section className='w-full'>
                            <h2 className="text-2xl font-semibold mb-2">Artworks</h2>

                            <div className='flex justify-center'>
                                <Carousel className="w-full max-w-76 sm:max-w-xs md:max-w-sm xl:max-w-6xl">
                                    <CarouselContent className="-ml-1">
                                        {gameDetails.artworks.map((art, index) => (
                                            <CarouselItem key={index} className="basis-1/2 pl-1 lg:basis-1/3">
                                                <div className="p-1" onClick={() => { setSelectedImg(`${url_igdb_t_original}${art.image_id}.jpg`) }}>
                                                    <Card
                                                        className="relative"
                                                    >
                                                        <CardContent className='aspect-video'>
                                                            <Image
                                                                src={`${url_igdb_t_original}${art.image_id}.jpg`}
                                                                alt={`screenshot-${art.id}`}
                                                                layout="fill"
                                                                objectFit="cover"
                                                                className="rounded-lg"
                                                            />
                                                        </CardContent>
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
                        gameDetails.videos && gameDetails.videos.length > 0 &&
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
                        gameDetails.similar_games && gameDetails.similar_games.length > 0 &&
                        <section className='w-full'>
                            <h2 className="text-2xl font-semibold mb-2">Similar Games</h2>
                            <div className='flex justify-center'>
                                <Carousel className="w-full max-w-76 sm:max-w-xs md:max-w-sm xl:max-w-6xl">
                                    <CarouselContent className="-ml-1">
                                        {gameDetails.similar_games.map((game, index) => (
                                            <CarouselItem key={index} className="basis-1/2 pl-1 lg:basis-1/5 cursor-pointer">
                                                <div
                                                    className="p-1"
                                                    onClick={() => { router.push(`/game-info?gameId=${game.id}`) }}
                                                >
                                                    <Card className="relative" >
                                                        <CardContent className='aspect-square'>
                                                            <Image
                                                                src={`${url_igdb_t_original}${game.cover?.image_id}.jpg`}
                                                                alt={`screenshot-${game.id}`}
                                                                layout="fill"
                                                                objectFit="cover"
                                                                className="rounded-lg"
                                                            />
                                                        </CardContent>
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
                        gameDetails.websites && gameDetails.websites.length > 0 &&
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
