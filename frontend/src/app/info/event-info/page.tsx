"use client"

import PageSkeleton from '@/components/PageSkeleton';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getEvent } from '@/lib/api/igdb';
import { eventTestData } from '@/lib/testData';
import { ApiError, event_networks, IGDBEvent } from '@/lib/types';
import { formatUnixTime, formatUnixTimeToDateTime, getNetworkIcon, normalizedURL } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { FiGlobe } from "react-icons/fi";
import NetworkIcon from '@/components/NetworkIcon';


const url_igdb_t_original = process.env.NEXT_PUBLIC_URL_IGDB_T_ORIGINAL;

export default function page() {
    const router = useRouter();
    const params = useSearchParams();
    const eventId = params.get("eventId");
    const [event, setEvent] = useState<IGDBEvent>();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [error, setError] = useState<ApiError | null>(null);

    useEffect(() => {
        let activate = true;
        if (!eventId) return;

        setStatus("loading");

        const run = async () => {
            const resp = await getEvent(eventId)
            if (!activate) return;

            if (resp.ok) {
                setEvent(resp.data);
                // setEvent(eventTestData);
                setStatus("success");
            } else {
                setStatus("error");
                setError(resp.error);
            }
        }
        run()
        return () => { activate = false }
    }, [eventId]);

    if (!event) return <PageSkeleton />

    return (
        <main className="flex grow w-full flex-col">
            {/* Banner Image */}
            {event.event_logo &&
                <div
                    className={`flex w-full p-4 bg-contain bg-center justify-center rounded-lg`}
                    style={{
                        backgroundImage: `url("${url_igdb_t_original}${event.event_logo.image_id}.jpg")`,
                        minHeight: '300px',
                    }}
                ></div>
            }
            <section className='mx-auto w-full max-w-500 px-4 pt-2 '>
                <Card>
                    <CardHeader>
                        <CardTitle className='flex justify-center'><h1>{event.name}</h1></CardTitle>
                        <div className='flex justify-end gap-1'>
                            <p>{formatUnixTimeToDateTime(event.start_time).date} - {formatUnixTimeToDateTime(event.end_time).date}</p>
                            <p>{formatUnixTimeToDateTime(event.start_time).time} - {formatUnixTimeToDateTime(event.end_time).time} {event.time_zone}</p>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <CardDescription className='text-lg'>{event.description}</CardDescription>
                    </CardContent>

                    <CardFooter className="justify-between items-start pt-0">
                        {event.live_stream_url ? (
                            <div className=''>
                                <a href={`${event.live_stream_url}`}>
                                    <Image
                                        src={"/imgs/watch-now.png"}
                                        alt="watch now"
                                        // fill
                                        width={128}
                                        height={32}
                                    />
                                </a>
                            </div>
                        ) : <div></div>}
                        {event.event_networks && (
                            <div>
                                <p>Check out these:</p>
                                <div className="flex gap-4">
                                    {event.event_networks?.map((network: event_networks) => (
                                        <p key={`network-${network.id}`}>
                                            <a href={normalizedURL(network.url)}>
                                                <NetworkIcon url={network.url} name={network.network_type.name} />
                                            </a>
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardFooter>
                </Card>

                {event.games && event.games.length > 0 && (
                    <section className='w-full'>
                        <div className='mx-auto '>
                            <h5 className="text-2xl font-semibold mb-2">Spotlight Games</h5>
                        </div>
                        <div className="w-full">
                            <ul className='mx-auto flex max-w-500 flex-wrap gap-2 '>
                                {event.games.map((game) => (
                                    <li
                                        key={`dlc-${game.id}`}
                                        className="bg-background text-secondary-foreground p-2 rounded-lg w-45 cursor-pointer"
                                        onClick={() => router.push(`/info/game-info?gameId=${game.id}`)}
                                    >
                                        <div className='relative aspect-3/4'>
                                            <Image
                                                src={game.cover?.image_id && game.cover?.image_id !== undefined ? `${url_igdb_t_original}${game.cover?.image_id}.jpg` : ""}
                                                alt={`cover-${game.id}`}
                                                fill
                                                sizes="120px"
                                                className="rounded-lg"
                                                onError={() => { return <FiGlobe /> }}
                                            />
                                        </div>
                                        <span>{game.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                )}

                {event.videos && event.videos.length > 0 && (
                    <section className='w-full'>
                        <h2 className="text-2xl font-semibold mb-2">Videos</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {event.videos.map((video) => (
                                <div key={`video-${video.id}`}>
                                    <h3 className="font-bold">{video.game?.name} {video.name}</h3>
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
                )}
            </section>
        </main>
    )
}
