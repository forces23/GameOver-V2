"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { getFavorites, getProfile } from "@/lib/api/db";
import { getPlatforms } from "@/lib/api/tgdb";
import { GameSimple, Profile } from "@/lib/types";
import { useUser } from "@auth0/nextjs-auth0";
import { randomUUID } from "crypto";
import Image from 'next/image';
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react"

export default function page() {
    const { user, isLoading } = useUser();
    const router = useRouter();
    const [profile, setProfile] = useState<Profile>();
    const [favGames, setFavGames] = useState<GameSimple[]>([]);

    useEffect(() => {
        if (isLoading || !user) return;

        const run = async () => {
            const tokenResponse = await fetch("/api/auth/token");
            const { accessToken } = await tokenResponse.json()

            const profileResp = await getProfile(accessToken);
            const favGamesResp = await getFavorites(accessToken);
            console.log(profileResp)
            if (profileResp.ok) setProfile(profileResp.data.data);
            if (favGamesResp.ok) setFavGames(favGamesResp.data.data);
        }
        run()
    }, [isLoading, user])

    const goToDifferentGame = (id: number) => {
        router.push(`/game-info?gameId=${id}`)
    }

    if (isLoading) {
        return (
            <div className="loading-state">
                <div className="loading-text">Loading user profile...</div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="flex flex-col w-full p-4 max-w-500">
            <Card className="w-full p-4 bg-card">
                <CardHeader className="relative aspect-9/3">
                    <Image
                        src={"/imgs/psb.png"}
                        alt={"profile banner"}
                        fill
                        loading="eager"
                        className="object-cover rounded-xl"
                    />
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    <div className="flex gap-3 flex-wrap">
                        <div className="relative w-50 aspect-square ">
                            <Image
                                src={profile?.avatar_url || user.picture || ""}
                                alt={"Profile Picture"}
                                className="rounded-2xl object-cover"
                                sizes="(max-width: 1024px) 50vw, 14vw"
                                fill
                            />
                        </div>
                        <div className="min-w-0">
                            <h2 className="truncate">{profile?.display_name || user.name}</h2>
                            <p>{profile?.email_visible && user.email}</p>
                        </div>
                    </div>
                    <div>
                        <h6 className="text-2xl font-semibold mb-2">About</h6>
                        <p className="text-wrap">{profile?.bio}</p>
                    </div>
                    {profile?.owned_systems && (
                        <section>
                            <h6 className="text-2xl font-semibold mb-2">Systems Owned</h6>
                            <ul className='flex flex-wrap gap-2'>
                                {profile?.owned_systems.map((system) => (
                                    <li
                                        key={`dlc-${system.id}`}
                                        className="bg-background text-secondary-foreground p-2 rounded-lg w-25 cursor-pointer"
                                    // onClick={() => goToConsole(system.id)}
                                    >
                                        <div className='relative aspect-square'>
                                            <Image
                                                src={`https://cdn.thegamesdb.net/images/original/consoles/png48/${system.icon}`}
                                                alt={`icon-${system.id}`}
                                                fill
                                                sizes="120px"
                                            />
                                        </div>
                                        <span>{system.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                    <div className="flex gap-3">
                        {favGames && favGames.length > 0 && (
                            <section className='w-full'>
                                <h6 className="text-2xl font-semibold mb-2">My Favorite Games</h6>
                                <div className='flex justify-center'>
                                    <Carousel className="w-full max-w-76 sm:max-w-xs md:max-w-sm xl:max-w-6xl">
                                        <CarouselContent className="-ml-1">
                                            {favGames.map((game, index) => (
                                                <CarouselItem key={index} className="basis-1/2 pl-1 lg:basis-1/5 cursor-pointer">
                                                    <div
                                                        className="p-1"
                                                        onClick={() => goToDifferentGame(game.igdb_id)}
                                                    >
                                                        <Card className="relative aspect-3/4" >
                                                            <Image
                                                                src={game.cover_url}
                                                                alt={`screenshot-${game.igdb_id}`}
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
                            </section>)}
                    </div>

                </CardContent>

            </Card>
        </div>
    );
}
