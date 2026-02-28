"use client"

import GamesCarousel from '@/components/info-pages/GamesCarousel';
import PageError from '@/components/PageError';
import PageSkeleton from '@/components/PageSkeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getConsoleGamesById, getPlatformById } from '@/lib/api/igdb';
import { outOfOrder, url_igdb_t_original } from '@/lib/constants';
import { AllTimeFavs, ApiError, GameData, IGDBPlatformDetail, TGDBPlatformDetailsResponseData } from '@/lib/types';
import { commaStringToList, formatRegion, formatUnixTimeToDateTime } from '@/lib/utils';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { v4 as uuidv4, validate as isUuid } from "uuid";

export default function page() {
    const [gameConsole, setGameConsole] = useState<IGDBPlatformDetail | null>(null);
    const params = useSearchParams();
    const consoleId = params.get("consoleId");
    const [error, setError] = useState<ApiError | null>(null);
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [games, setGames] = useState<GameData[]>([]);


    useEffect(() => {
        let active = true;

        const run = async () => {
            if (!consoleId) {
                setStatus("error");
                setError({ status: 400, code: "BAD_REQUEST", message: "Missing Console ID" });
                return;
            }

            setStatus("loading");
            setGameConsole(null);
            setError(null);

            const result = await getPlatformById(consoleId);
            const gameResults = await getConsoleGamesById(consoleId);
            if (!active) return;

            if (result.ok) {
                setGameConsole(result.data[0])
                setStatus("success")
            } else {
                setError(result.error);
                setStatus("error");
            }

            if (gameResults.ok) {
                setGames(gameResults.data)
                setStatus("success")
            } else {
                setError(gameResults.error);
                setStatus("error");
            }
        };

        run();
        return () => { active = false }
    }, [consoleId])

    if (status === "loading") return <PageSkeleton />;
    if (status === "error") return <PageError />;

    return (
        <div className='flex w-full flex-col gap-4 p-4'>
            {/* * Banner Image * */}
            {/* {gameConsole.images.images.banners &&
                    <div
                        className={`flex w-full p-4 bg-cover bg-center justify-center rounded-lg`}
                        style={{
                            backgroundImage: `url("${url_igdb_t_original}${}")`,
                            minHeight: '300px'
                        }}
                    ></div>
                } */}
            <Card className='mx-auto px-4 w-full max-w-500'>
                <div className='flex flex-wrap'>
                    <CardHeader className='justify-center w-full'>
                        <CardTitle>
                            <h1>{gameConsole?.name}</h1>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='w-full'>
                        <div className="flex flex-col gap-6 md:flex-row md:items-center pb-4">
                            {gameConsole?.platform_logo && (
                                <div className='relative w-60 aspect-square  mx-auto bg-gray-300 p-2 rounded-2xl'>
                                    <Image
                                        src={gameConsole.platform_logo?.image_id && gameConsole.platform_logo?.image_id !== undefined ? `${url_igdb_t_original}${gameConsole.platform_logo?.image_id}.jpg` : outOfOrder}
                                        alt='console-image'
                                        fill
                                        className='object-contain object-center rounded-2xl px-2'
                                    />
                                </div>
                            )}
                            <CardDescription className="md:flex-1 md:flex md:items-center md:justify-center">
                                {gameConsole?.summary ?? gameConsole?.versions?.[0]?.summary ?? "Oh No! we are missing a description. it will be coming soon. <(˶>⩊<˶)>"}
                            </CardDescription>
                        </div>
                        <div className='flex flex-col gap-1 pb-6'>
                            {gameConsole?.alternative_name && (
                                <div className='flex gap-2 items-center flex-wrap'>
                                    <strong>Alt Names: </strong>
                                    {commaStringToList(gameConsole.alternative_name).map((alt) => (
                                        <span key={`item-${alt}-${uuidv4()}`} className="p-2 bg-background text-secondary-foreground rounded-lg">
                                            {alt}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {gameConsole?.abbreviation && (
                                <div className='flex gap-2 items-center'>
                                    <strong>Shortened Name: </strong>
                                    {commaStringToList(gameConsole.abbreviation).map((abbre) => (
                                        <span key={`item-${abbre}-${uuidv4()}`} className="p-2 bg-background text-secondary-foreground rounded-lg">
                                            {abbre}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {gameConsole?.abbreviation && (
                                <div className='flex gap-2 items-center'>
                                    <strong>Current Generation: </strong>
                                    <span className="bg-background text-secondary-foreground p-2 rounded-lg">
                                        {gameConsole.generation}
                                    </span>
                                </div>
                            )}
                            {gameConsole?.platform_family && (
                                <div className='flex gap-2 items-center'>
                                    <strong>Family: </strong>
                                    <span className="bg-background text-secondary-foreground p-2 rounded-lg">
                                        {gameConsole.platform_family.name}
                                    </span>
                                </div>
                            )}
                        </div>
                        {gameConsole?.versions && gameConsole.versions.length > 0 && (
                            <div className='w-full'>
                                <Card className="w-full ">
                                    <CardHeader>
                                        <CardTitle>Other Versions of the {gameConsole?.name ?? "Console"}</CardTitle>
                                        <CardDescription>
                                            Check out the different variations of this console that were created!
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Accordion type="multiple" defaultValue={[`${gameConsole.versions[0].slug}`]}>
                                            {gameConsole.versions.map((ver) => (
                                                <AccordionItem key={ver.id} value={ver.slug}>
                                                    <AccordionTrigger className='items-center'>
                                                        <div className='relative w-20 aspect-square bg-gray-300 rounded-2xl'>
                                                            <Image
                                                                src={ver.platform_logo?.image_id && ver.platform_logo?.image_id !== undefined ? `${url_igdb_t_original}${ver.platform_logo?.image_id}.jpg` : outOfOrder}
                                                                alt='version-image'
                                                                fill
                                                                className='object-contain object-center rounded-2xl px-2'
                                                            />
                                                        </div>
                                                        <span className='w-full'>
                                                            {ver.name}
                                                        </span>
                                                    </AccordionTrigger>
                                                    <AccordionContent >
                                                        <div className='pb-2'>
                                                            {ver.summary}
                                                        </div>
                                                        {ver.platform_version_release_dates && ver.platform_version_release_dates.length > 0 && (
                                                            <div className='pb-4'>
                                                                <span className='pe-2'><strong>Released Dates by Location: </strong></span>
                                                                <ul className='flex gap-7 flex-wrap'>
                                                                    {ver.platform_version_release_dates.map((relDate) => (
                                                                        <li key={`relDate-${relDate.release_region?.region}`} className='flex flex-col'>
                                                                            <div>
                                                                                <strong>{formatRegion(relDate.release_region?.region || "")} </strong>
                                                                            </div>
                                                                            <div>
                                                                                {formatUnixTimeToDateTime(relDate.date).date}
                                                                            </div>
                                                                        </li>
                                                                    ))}

                                                                </ul>
                                                            </div>
                                                        )}
                                                        <div className='grid grid-cols-2 md:grid-cols-3 gap-5'>
                                                            {ver.cpu && (
                                                                <div>
                                                                    <span className='pe-2'><strong>CPU: </strong></span>
                                                                    <ul>
                                                                        {commaStringToList(ver.cpu).map((s) => (
                                                                            <li key={`item-${ver.id}-${uuidv4()}`} className="p-1">
                                                                                <div className='p-2 bg-background text-secondary-foreground rounded-lg'>
                                                                                    {s}
                                                                                </div>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}

                                                            {ver.graphics && (
                                                                <div>
                                                                    <span className='pe-2'><strong>Graphics: </strong></span>
                                                                    <ul>
                                                                        {commaStringToList(ver.graphics).map((s) => (
                                                                            <li key={`item-${ver.id}-${uuidv4()}`} className="p-1">
                                                                                <div className='p-2 bg-background text-secondary-foreground rounded-lg'>
                                                                                    {s}
                                                                                </div>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}

                                                            {ver.connectivity && (
                                                                <div>
                                                                    <span className='pe-2'><strong>Connectivity: </strong></span>
                                                                    <ul>
                                                                        {commaStringToList(ver.connectivity).map((s) => (
                                                                            <li key={`item-${ver.id}-${uuidv4()}`} className="p-1">
                                                                                <div className='p-2 bg-background text-secondary-foreground rounded-lg'>
                                                                                    {s}
                                                                                </div>
                                                                            </li>
                                                                        ))}
                                                                    </ul>

                                                                </div>
                                                            )}


                                                            {ver.media && (
                                                                <div>
                                                                    <span className='pe-2'><strong>Media Type: </strong></span>
                                                                    <ul>
                                                                        {commaStringToList(ver.media).map((s) => (
                                                                            <li key={`item-${ver.id}-${uuidv4()}`} className="p-1">
                                                                                <div className='p-2 bg-background text-secondary-foreground rounded-lg'>
                                                                                    {s}
                                                                                </div>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}

                                                            {ver.memory && (
                                                                <div>
                                                                    <span className='pe-2'><strong>Memory: </strong></span>
                                                                    <ul>
                                                                        {commaStringToList(ver.memory).map((s) => (
                                                                            <li key={`item-${ver.id}-${uuidv4()}`} className="p-1">
                                                                                <div className='p-2 bg-background text-secondary-foreground rounded-lg'>
                                                                                    {s}
                                                                                </div>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}

                                                            {ver.storage && (
                                                                <div className=''>
                                                                    <span className='pe-2'><strong>Storage: </strong></span>
                                                                    <ul>
                                                                        {commaStringToList(ver.storage).map((s) => (
                                                                            <li key={`item-${ver.id}-${uuidv4()}`} className="p-1">
                                                                                <div className='p-2 bg-background text-secondary-foreground rounded-lg'>
                                                                                    {s}
                                                                                </div>
                                                                            </li>
                                                                        ))}
                                                                    </ul>

                                                                </div>
                                                            )}

                                                            {ver.resolutions && (
                                                                <div>
                                                                    <span className='pe-2'><strong>Resolutions: </strong></span>
                                                                    <ul>
                                                                        {commaStringToList(ver.resolutions).map((s) => (
                                                                            <li key={`item-${ver.id}-${uuidv4()}`} className="p-1">
                                                                                <div className='p-2 bg-background text-secondary-foreground rounded-lg'>
                                                                                    {s}
                                                                                </div>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}

                                                            {ver.sound && (
                                                                <div>
                                                                    <span className='pe-2'><strong>Sound: </strong></span>
                                                                    <ul>
                                                                        {commaStringToList(ver.sound).map((s) => (
                                                                            <li key={`item-${ver.id}-${uuidv4()}`} className="p-1">
                                                                                <div className='p-2 bg-background text-secondary-foreground rounded-lg'>
                                                                                    {s}
                                                                                </div>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}

                                                            {ver.output && (
                                                                <div>
                                                                    <span className='pe-2'><strong>Output: </strong></span>
                                                                    <ul>
                                                                        {commaStringToList(ver.output).map((s) => (
                                                                            <li key={`item-${ver.id}-${uuidv4()}`} className="p-1">
                                                                                <div className='p-2 bg-background text-secondary-foreground rounded-lg'>
                                                                                    {s}
                                                                                </div>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </CardContent>
                    {/* Popular games on this console */}
                    <GamesCarousel games={games} moreUrl={`/games?consoleId=${consoleId}&page=1`} />
                </div>
            </Card>
        </div>
    )
}
