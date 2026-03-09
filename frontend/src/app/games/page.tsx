"use client"

import SearchBar from '@/components/SearchBar';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { outOfOrder, url_igdb_t_original } from '@/lib/constants';
import { getAllTimeFavorites, getGameSearch } from '@/lib/api/igdb';
import { ApiError, GameData, ParamsObj } from '@/lib/types';
import { buildFiltersObject } from '@/lib/utils';
import PageSkeleton from '@/components/PageSkeleton';
import PageError from '@/components/PageError';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Field, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

    const currentPage = Math.max(1, Number(params.get("page") ?? paginationDetails?.page ?? 1));
    const maxPages = Math.max(1, Number(paginationDetails?.maxPages ?? 1));
    // start at current page, but clamp so we never go past max
    const startPage = Math.min(currentPage, Math.max(1, maxPages - 2));

    const length = Math.min(3, maxPages - startPage + 1);


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

        console.log(params);

        const run = async () => {
            setStatus("loading");

            const filters = buildFiltersObject(params)
            setParamFilters(filters)

            // when no params it sets the data default to all time favorite list of games
            if (params.size === 0) {
                // TODO: see if you can use the same endpoint /games-search instead
                // TODO: need to make the endpoint have params so that the limit and page is accurate always
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
            console.log(filters);
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
        run();
        return () => { active = false }
    }, [params]);

    const updateParams = (param: "page" | "limit", value: string) => {
        console.log("updateParams -- ", param, ":", value)

        const newParams = new URLSearchParams(params.toString())

        if (param === "page" && value != newParams.get("page")) {
            newParams.set("page", value)
        }
        if (param === "limit" && value != newParams.get("limit")) {
            console.log("limit")
            newParams.set("limit", value)
        }

        router.push(`/games?${newParams.toString()}`)
    }



    // if (status === "loading") return <PageSkeleton />
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
                <div className="pb-4">
                    <div className='w-full flex justify-between flex-col md:flex-row'>
                        <h5 className="w-full pb-2">{paginationDetails?.contentCount || 0} items</h5>
                        <div className='flex gap-3'>
                            <Field orientation="horizontal" className="whitespace-nowrap">
                                {/* <FieldLabel htmlFor="select-rows-per-page">Rows per page</FieldLabel> */}
                                {/* TODO: need to figure out even when i do a search from the default /games endpoint why does it not update when limit is in params */}
                                <Select defaultValue={params.get("limit") || "25"} onValueChange={(value) => updateParams("limit", value)}>
                                    <SelectTrigger className="w-20" id="select-rows-per-page">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent align="start">
                                        <SelectGroup>
                                            <SelectItem value="25">25</SelectItem>
                                            <SelectItem value="50">50</SelectItem>
                                            <SelectItem value="100">100</SelectItem>
                                            <SelectItem value="200">200</SelectItem>

                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </Field>
                            {paginationDetails && (
                                <Pagination className='mx-0 justify-end'>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => {
                                                    if (Number(paginationDetails.page) > 1) {
                                                        updateParams("page", String(Number(paginationDetails.page) - 1))
                                                    }
                                                }}
                                                className={`${Number(paginationDetails.page) > 1 ? "cursor-pointer" : "bg-gray-500/40 pointer-events-none"}`}
                                                aria-disabled={Number(paginationDetails.page) <= 1}
                                            />
                                        </PaginationItem>
                                        {paginationDetails?.maxPages && Array.from(
                                            { length: length },
                                            (_, i) => startPage + i)
                                            .map((page: number) => (
                                                <PaginationItem key={page}>
                                                    <PaginationLink
                                                        onClick={() => updateParams("page", String(page))}
                                                        isActive={currentPage === page}
                                                        className='cursor-pointer'
                                                    >
                                                        {page}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            ))}
                                        {(Number(paginationDetails.page) <= Number(paginationDetails.maxPages) - 3) && (
                                            <>
                                                <PaginationItem>
                                                    <PaginationEllipsis />
                                                </PaginationItem>
                                                <PaginationItem>
                                                    <PaginationLink
                                                        onClick={() => updateParams("page", `${paginationDetails.maxPages}`)}
                                                        isActive={params.get("page") === `${paginationDetails.maxPages}`}
                                                        className='cursor-pointer'
                                                    >
                                                        {paginationDetails.maxPages}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            </>
                                        )}
                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => {
                                                    if (Number(paginationDetails.page) != Number(paginationDetails.maxPages)) {
                                                        updateParams("page", String(Number(paginationDetails.page) + 1))
                                                    }
                                                }}
                                                className={`${Number(paginationDetails.page) != Number(paginationDetails.maxPages) ? "cursor-pointer" : "bg-gray-500/40 pointer-events-none"}`}
                                                aria-disabled={Number(paginationDetails.page) >= Number(paginationDetails.maxPages)}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            )}
                        </div>
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
            </div>
        </>
    )
}
