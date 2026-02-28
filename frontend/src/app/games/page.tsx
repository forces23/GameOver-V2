"use client"

import SearchBar from '@/components/SearchBar';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { outOfOrder, url_igdb_t_original } from '@/lib/constants';
import { getAllTimeFavorites, getGameSearch } from '@/lib/api/igdb';
import { GameData, ParamsObj } from '@/lib/types';
import { buildFiltersObject } from '@/lib/utils';

export default function page() {
    const [games, setGames] = useState<GameData[]>([]);
    const [filteredGames, setFilteredGames] = useState<GameData[]>([]);
    const params = useSearchParams();
    const [paramFilters, setParamFilters] = useState<ParamsObj>();
    const router = useRouter();

    const onSubmitFilters = (payload: ParamsObj) => {
        const sp = new URLSearchParams();

        if (payload.query.trim()) sp.set("query", payload.query.trim());
        payload.genres.forEach((id) => sp.append("genres", String(id)));
        payload.themes.forEach((id) => sp.append("themes", String(id)));
        payload.consoles.forEach((id) => sp.append("consoles", String(id)));
        if (payload.fromDate) sp.set("fromDate", payload.fromDate);
        if (payload.toDate) sp.set("toDate", payload.toDate);

        sp.set("page", String(payload.page));
        sp.set("limit", String(payload.limit));
        sp.set("sort", payload.sort);

        router.replace(`/games?${sp.toString()}`, { scroll: false });
    }

    useEffect(() => {
        let active = true;
        
        const run = async () => {
            const filters = buildFiltersObject(params)
            setParamFilters(filters)

            // when no params it sets the data default to all time favorite list of games
            if (params.size === 0) {
                // TODO: see if you can use the same endpoint /games-search instead
                const result = await getAllTimeFavorites(50);
                if (!active) return;
                if (result.ok) {
                    setGames(result.data);
                    setFilteredGames(result.data);
                }
                return;
            }

            const result = await getGameSearch(filters)
            if (!active) return;
            if (result.ok) {
                setGames(result.data);
                setFilteredGames(result.data);
            }
        };
        run();
        return () => { active = false }
    }, [params]);

    return (
        <>
            <div className='w-full px-4'>
                <div className="pb-4 text-center">
                    <h3 className="w-full pb-2">Games</h3>
                    <hr />
                </div>
                <div className='mx-auto pb-4 max-w-5xl'>
                    <SearchBar
                        originalData={games}
                        setData={setFilteredGames}
                        searchType='game'
                        filters={paramFilters}
                        onSubmitFilters={onSubmitFilters}
                    />
                </div>
                <div className="pb-4">
                    <h5 className="w-full text-center pb-2">{filteredGames.length} items</h5>
                    <hr className="" />
                </div>
                <section>
                    <ul className='flex flex-wrap gap-3'>
                        {filteredGames.map((game) => (
                            <div
                                key={`console-${game.id}-${game.slug}`}
                                onClick={() => router.push(`/info/game-info?gameId=${game.id}`)}
                                className="relative"
                            >
                                <li className="bg-background text-secondary-foreground rounded-lg w-32 cursor-pointer">
                                    <div className='relative w-32 aspect-3/4 bg-black rounded-2xl'>
                                        <Image
                                            src={game.cover?.image_id && game.cover?.image_id !== undefined ? `${url_igdb_t_original}${game.cover?.image_id}.jpg` : outOfOrder}
                                            alt={`game-${game.slug}-${game.id}`}
                                            fill
                                            sizes="120px"
                                            className="object-contain object-center rounded-2xl"
                                        />
                                    </div>
                                    <span>{game.name}</span>
                                </li>
                            </div>
                        ))}
                    </ul>
                </section>
            </div>
        </>
    )
}
