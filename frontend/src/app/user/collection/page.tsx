"use client"

import { getCollectedGames } from '@/lib/api/db';
import { useUser } from '@auth0/nextjs-auth0'
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemMedia,
    ItemTitle,
} from "@/components/ui/item"
import { formatUnixTime } from '@/lib/utils';
import { ApiError, GameSimple, Genre } from '@/lib/types';
import Link from 'next/link';
import { FaStar } from 'react-icons/fa';
import SearchBar from '@/components/SearchBar';
import PageSkeleton from '@/components/PageSkeleton';
import PageError from '@/components/PageError';


export default function page() {
    const user = useUser();
    const [collection, setCollection] = useState<GameSimple[]>([]);
    const [filteredCollection, setFilteredCollection] = useState<GameSimple[]>([]);
    const [error, setError] = useState<ApiError | null>(null);
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

    useEffect(() => {
        let active = true;

        const run = async () => {
            setStatus("loading");

            const tokenResponse = await fetch("/api/auth/token");
            const { accessToken } = await tokenResponse.json()
            if (!active) return;

            const resp = await getCollectedGames("collected", accessToken);
            if (!active) return;

            if (resp.ok) {
                setCollection(resp.data.games);
                setFilteredCollection(resp.data.games);
                setStatus("success");
            } else {
                setStatus("error");
                setError(resp.error);
            }
        }
        run();
        return () => {active = false}
    }, []);

    if (status === "loading") return <PageSkeleton />
    if (status === "error") return <PageError />

    return (
        <div className="">
            <div className="pb-4">
                <h1 className="w-full pb-2">Owned Games</h1>
                <hr />
            </div>
            <div className='mx-auto pb-4 max-w-5xl'>
                <SearchBar originalData={collection} setData={setFilteredCollection} searchType='game' />
            </div>
            <div className="pb-4">
                <h5 className="w-full text-center pb-2">{collection.length} items</h5>
                <hr />
            </div>
            <ItemGroup className="gap-2">
                {filteredCollection && filteredCollection.map((game: GameSimple) => {
                    return (
                        <Item key={game.name} variant="outline" asChild role="listitem" className="bg-card">
                            <Link
                                href={`/info/game-info?gameId=${game.igdb_id}`}
                                className="relative"
                            >
                                <ItemMedia
                                    className='relative w-32 aspect-3/4'
                                >
                                    <Image
                                        src={game.cover_url}
                                        alt={game.name}
                                        fill
                                        className=" object-cover"
                                    />
                                </ItemMedia>
                                <ItemContent>
                                    <ItemTitle className="w-full">
                                        <h5 className='pe-4'>{game.name}</h5>
                                    </ItemTitle>
                                    <ItemContent>
                                        <ul className='flex flex-wrap gap-2'>
                                            {game.genres.map((genre: Genre) => (
                                                <li
                                                    key={`genre-${genre.id}`}
                                                    className="bg-background text-secondary-foreground p-2 rounded-lg "
                                                >
                                                    {genre.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </ItemContent>
                                    <ItemDescription>console: etc</ItemDescription>
                                </ItemContent>
                                <ItemContent className="flex-none text-center ">
                                    <ItemDescription>{formatUnixTime(game.first_release_date)}</ItemDescription>
                                </ItemContent>
                                {game.favorite && (<h6 className="absolute top-4 right-4"><FaStar /></h6>)}
                            </Link>
                        </Item>
                    )
                })}
            </ItemGroup>
        </div>
    )
}
