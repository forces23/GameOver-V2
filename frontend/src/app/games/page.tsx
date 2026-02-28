"use client"

import SearchBar from '@/components/SearchBar'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation';
import { outOfOrder, url_igdb_t_original } from '@/lib/constants';
import {  getAllTimeFavorites, getGameSearch } from '@/lib/api/igdb';

export default function page() {
    const [games, setGames] = useState<any[]>([]);
    const [filteredGames, setFilteredGames] = useState<any[]>([]);
    const params = useSearchParams();
    const [paramFilters, setParamFilters] = useState<any>({});
    const router = useRouter();

    const toNumArray = (values: string[]) =>
        values.map((v) => Number(v)).filter((n) => Number.isFinite(n));

    const onSubmitFilters = (payload: {
        query: string;
        genres: number[];
        themes: number[];
        consoles: number[];
        fromDate: string;
        toDate: string;
        page: number;
        limit: number;
        sort: string;
    }) => {
        const sp = new URLSearchParams();

        if (payload.query.trim()) sp.set("query", payload.query.trim());
        payload.genres.forEach((id) => sp.append("genres", String(id)));
        payload.themes.forEach((id) => sp.append("themes", String(id)));
        payload.consoles.forEach((id) => sp.append("consoles", String()));
        if (payload.fromDate) sp.set("fromDate", payload.fromDate);
        if (payload.toDate) sp.set("toDate", payload.toDate);

        sp.set("page", String(payload.page));
        sp.set("limit", String(payload.limit));
        sp.set("sort", payload.sort);

        router.replace(`/games?${sp.toString()}`, { scroll: false });
    }

    useEffect(() => {
        const run = async () => {
            const filters = {
                query: params.get("query") ?? "",
                genres: toNumArray(params.getAll("genres")) ?? [],
                themes: toNumArray(params.getAll("themes")) ?? [],
                consoles: toNumArray(params.getAll("consoles")) ?? [],
                fromDate: params.get("fromDate") ?? "",
                toDate: params.get("toDate") ?? "",
                page: Number(params.get("page")) ?? 1,
                limit: Number(params.get("limit")) && Number(params.get("limit")) !== 0 ? Number(params.get("limit")) : 50,
                sort: params.get("sort") ?? "asc"
            }

            setParamFilters(filters)

            if (params.size === 0) {
                const result = await getAllTimeFavorites(50);
                if (result.ok) {
                    setGames(result.data);
                    setFilteredGames(result.data);
                }
                return;
            }

            const result = await getGameSearch(filters)
            if (result.ok) {
                setGames(result.data);
                setFilteredGames(result.data);
            }
        };
        run();


    }, [params]);

    return (
        <div className='flex grow w-full max-w-500'>
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
        </div>
    )
}
