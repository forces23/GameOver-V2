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
import { Genre } from '@/lib/types';
import Link from 'next/link';
import { FaStar } from 'react-icons/fa';
import SearchBar from '@/components/SearchBar';


export default function page() {
    const user = useUser();
    const [collection, setCollection] = useState<any[]>([]);
    const [filteredCollection, setFilteredCollection] = useState<any[]>([])

    useEffect(() => {
        const fetchCollection = async () => {
            const tokenResponse = await fetch("/api/auth/token");
            const { accessToken } = await tokenResponse.json()

            const resp = await getCollectedGames("collected", accessToken);
            // console.log(resp)

            if (resp.ok) setCollection(resp.data.games);
        }
        fetchCollection();
    }, [])

    /* need these items to display:
            X image
            X name 
            X release date
            - console you have it for (pc, xbox, playstation, etc)
    */
    return (
        <div className="">
            <div className="pb-4">
                            <h1 className="w-full pb-2">Owned Games</h1>
                            <hr />
                        </div>
                        <div className='mx-auto pb-4 max-w-5xl'>
                            <SearchBar originalData={collection} setData={setFilteredCollection} />
                        </div>
            <div className="pb-4">
                <h5 className="w-full text-center pb-2">{collection.length} items</h5>
                <hr />
            </div>
            <ItemGroup className="gap-2">
                {filteredCollection && filteredCollection.map((game: any, index: number) => {
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
                                        {/* <span className="text-muted-foreground">{song.album}</span> */}
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
