"use client"

import SearchBar from '@/components/search/SearchBar';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { outOfOrder, url_igdb_t_original } from '@/lib/constants';
import { getAllTimeFavorites, getGameSearch } from '@/lib/api/igdb';
import { ApiError, GameData, ParamsObj } from '@/lib/types';
import { buildFiltersObject } from '@/lib/utils';
import PageError from '@/components/PageError';
import AnimatedLoading from '@/components/AnimatedLoading';
import PaginationButtons from '@/components/info-pages/PaginationButtons';

export default function page() {
    const [games, setGames] = useState<GameData[]>([]);
    const [filteredGames, setFilteredGames] = useState<GameData[]>([]);
    const params = useSearchParams();
    const [paramFilters, setParamFilters] = useState<ParamsObj>();
    const router = useRouter();
    const [error, setError] = useState<ApiError | null>(null);
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [paginationDetails, setPaginationDetails] = useState<{
        page: string,
        limit: string,
        hasMore: boolean,
        contentCount: string,
        maxPages: string
    } | null>(null);

    const onSubmitFilters = (payload: ParamsObj) => {
        const sp = new URLSearchParams();

        if (payload.query.trim()) sp.set("query", payload.query.trim());
        payload.genres.forEach((id) => sp.append("genres", String(id)));
        payload.themes.forEach((id) => sp.append("themes", String(id)));
        payload.consoles.forEach((id) => sp.append("consoles", String(id)));
        payload.gameModes.forEach((id) => sp.append("gameModes", String(id)));
        if (payload.fromDate) sp.set("fromDate", payload.fromDate);
        if (payload.toDate) sp.set("toDate", payload.toDate);

        sp.set("page", String(payload.page));
        sp.set("limit", String(payload.limit));
        sp.set("sort", payload.sort);

        router.replace(`/games?${sp.toString()}`, { scroll: false });
    }

    useEffect(() => {
        let active = true;
        setStatus("loading");

        const run = async () => {
            const filters = buildFiltersObject(params)
            setParamFilters(filters)

            // when no params it sets the data default to all time favorite list of games
            if (params.size === 0) {
                const atfResult = await getAllTimeFavorites(50);
                if (!active) return;
                if (atfResult.ok) {
                    setGames(atfResult.data);
                    setFilteredGames(atfResult.data);
                    setStatus("success");
                } else {
                    setStatus("error");
                    setError(atfResult.error);
                }
                return;
            }

            const gsResult = await getGameSearch(filters)
            if (!active) return;
            if (gsResult.ok) {
                console.log(gsResult);
                setGames(gsResult.data.data);
                setFilteredGames(gsResult.data.data);
                setPaginationDetails(gsResult.data.pagination)
                setStatus("success");
            } else {
                setStatus("error");
                setError(gsResult.error);
            }
        };
        run()
        return () => { active = false }
    }, [params]);

    // if (status === "error") return <PageError /> TODO:have to fix for 404 response when search returns 404

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
                {status === "loading" ? (
                    <AnimatedLoading />
                ) : (
                    <>
                        <div className="pb-4">
                            <div className='w-full flex justify-between flex-col md:flex-row'>
                                <h5 className="w-full pb-2">
                                    {paginationDetails?.contentCount || 0} items
                                </h5>
                                <PaginationButtons {...paginationDetails} />
                            </div>
                            <hr className="" />
                        </div>
                        <section className='flex w-full justify-center'>
                            <ul className='flex flex-wrap gap-3'>
                                {filteredGames.map((game) => (
                                    <div
                                        key={`console-${game.id}-${game.slug}`}
                                        onClick={() => router.push(`/info/game-info?gameId=${game.id}`)}
                                        className="relative"
                                    >
                                        <li className="bg-background text-secondary-foreground rounded-lg w-30 md:w-32 cursor-pointer">
                                            <div className='relative w-30 md:w-32 aspect-3/4 bg-black rounded-2xl'>
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
                    </>
                )}

            </div>
        </>
    )
}
