"use client"

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FaArrowRight, FaCompass, FaFilter, FaGamepad, FaSearch } from "react-icons/fa";
import SearchBar from "@/components/search/SearchBar";
import AnimatedLoading from "@/components/AnimatedLoading";
import PaginationButtons from "@/components/info-pages/PaginationButtons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllTimeFavorites, getGameSearch } from "@/lib/api/igdb";
import { outOfOrder, url_igdb_t_original } from "@/lib/constants";
import { GameData, ParamsObj } from "@/lib/types";
import { buildFiltersObject, updateSearchParams } from "@/lib/utils";

function StatCard({
    label,
    value,
    description,
    icon,
}: {
    label: string;
    value: string | number;
    description: string;
    icon: React.ReactNode;
}) {
    return (
        <Card className="border-border/60 bg-card/80 shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                    <CardDescription className="text-xs font-medium uppercase tracking-[0.18em]">
                        {label}
                    </CardDescription>
                    <div className="text-muted-foreground">{icon}</div>
                </div>
                <CardTitle className="text-3xl">{value}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}

export default function Page() {
    const [games, setGames] = useState<GameData[]>([]);
    const [filteredGames, setFilteredGames] = useState<GameData[]>([]);
    const params = useSearchParams();
    const [paramFilters, setParamFilters] = useState<ParamsObj>();
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [paginationDetails, setPaginationDetails] = useState<{
        page: string;
        limit: string;
        hasMore: boolean;
        contentCount: string;
        maxPages: string;
    } | null>(null);

    const onSubmitFilters = (payload: ParamsObj) => {
        const searchParams = new URLSearchParams();
        const sp = updateSearchParams(payload, searchParams);
        router.replace(`/games?${sp.toString()}`, { scroll: false });
    };

    useEffect(() => {
        let active = true;
        setStatus("loading");

        const run = async () => {
            const filters = buildFiltersObject(params);
            setParamFilters(filters);

            if (params.size === 0) {
                const atfResult = await getAllTimeFavorites(50);
                if (!active) return;
                if (atfResult.ok) {
                    setGames(atfResult.data);
                    setFilteredGames(atfResult.data);
                    setPaginationDetails(null);
                    setStatus("success");
                } else {
                    setStatus("error");
                }
                return;
            }

            const gsResult = await getGameSearch(filters);
            if (!active) return;
            if (gsResult.ok) {
                setGames(gsResult.data.data);
                setFilteredGames(gsResult.data.data);
                setPaginationDetails(gsResult.data.pagination);
                setStatus("success");
            } else {
                setStatus("error");
            }
        };

        run();
        return () => {
            active = false;
        };
    }, [params]);

    const visibleCount = filteredGames.length;
    const totalCount = paginationDetails?.contentCount ?? visibleCount;
    const showingFilteredResults = params.size > 0;

    return (
        <main className="mx-auto flex w-full max-w-500 flex-col gap-3 px-4 py-8 text-card-foreground">
            {/* <section className="relative overflow-hidden rounded-[2rem] border border-border/50 bg-[radial-gradient(circle_at_top_left,hsl(var(--secondary))_0%,transparent_35%),linear-gradient(135deg,hsl(var(--card))_0%,hsl(var(--background))_100%)] px-6 py-8 shadow-sm md:px-8 md:py-10">
                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-secondary/40 blur-3xl" />

                <div className="relative z-10 flex flex-col gap-6">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">Game Library</Badge>
                        <Badge variant="outline">{showingFilteredResults ? "Filtered Search" : "Featured Catalog"}</Badge>
                    </div>

                    <div className="max-w-3xl">
                        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                            Browse the catalog with a clearer visual rhythm.
                        </h1>
                        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                            Search by title, refine with your existing filters, and move through the game catalog
                            without losing the current page flow you already have in place.
                        </p>
                    </div>
                </div>
            </section> */}

            {/* <section className="grid gap-4 md:grid-cols-3">
                <StatCard
                    label="Results"
                    value={totalCount}
                    description="Total games returned by the current search state."
                    icon={<FaSearch />}
                />
                <StatCard
                    label="Visible Cards"
                    value={visibleCount}
                    description="Games currently rendered in the grid below."
                    icon={<FaGamepad />}
                />
                <StatCard
                    label="Browse Mode"
                    value={showingFilteredResults ? "Custom search" : "All-time favorites"}
                    description="Keeps the existing discovery flow while surfacing stronger visuals."
                    icon={<FaCompass />}
                />
            </section> */}

            <Card className="border-border/60 bg-card/70 shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <FaFilter className="text-muted-foreground" />
                        <CardTitle className="text-2xl">Search and filter</CardTitle>
                    </div>
                    <CardDescription>
                        Use the same filter flow you already have, now with a cleaner page frame around it.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SearchBar
                        originalData={games}
                        setData={setFilteredGames}
                        searchType="game"
                        filters={paramFilters}
                        onSubmitFilters={onSubmitFilters}
                    />
                </CardContent>
            </Card>

            {status === "loading" ? (
                <AnimatedLoading />
            ) : (
                <>
                    <Card className="border-border/60 bg-card/75 shadow-sm">
                        <CardContent className="flex flex-col px-6 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">Browse Results</p>
                                <h2 className="text-2xl font-semibold tracking-tight">
                                    {totalCount} games available
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {showingFilteredResults
                                        ? "Refined by your current query parameters and filters."
                                        : "Showing the default all-time favorites selection."}
                                </p>
                            </div>
                            <div className="flex justify-start md:justify-end">
                                {paginationDetails && <PaginationButtons {...paginationDetails} />}
                            </div>
                        </CardContent>
                    </Card>

                    {filteredGames.length === 0 ? (
                        <Card className="border-dashed border-border/70 bg-card/40">
                            <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                                <Badge variant="outline">No games found</Badge>
                                <h3 className="text-2xl font-semibold">Your current filters returned no games.</h3>
                                <p className="max-w-xl text-sm text-muted-foreground">
                                    Adjust the search text or clear some filters to expand the result set.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                            {filteredGames.map((game) => (
                                <button
                                    key={`game-${game.id}-${game.slug}`}
                                    onClick={() => router.push(`/info/game-info?gameId=${game.id}`)}
                                    className="group text-left "
                                    type="button"
                                >
                                    <Card className="py-0 h-full overflow-hidden border-border/60 bg-card/85 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                                        <CardContent className="flex h-full flex-col p-0">
                                            <div className="relative aspect-[3/4] overflow-hidden border-b border-border/50 bg-[linear-gradient(180deg,hsl(var(--muted))_0%,hsl(var(--secondary))_100%)]">
                                                <Image
                                                    src={
                                                        game.cover?.image_id
                                                            ? `${url_igdb_t_original}${game.cover.image_id}.jpg`
                                                            : outOfOrder
                                                    }
                                                    alt={`game-${game.slug}-${game.id}`}
                                                    fill
                                                    sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 20vw"
                                                    className="object-contain object-center transition-transform duration-300 group-hover:scale-105"
                                                />
                                            </div>

                                            <div className="flex flex-1 flex-col gap-4 p-4">
                                                <div className="space-y-2">
                                                    <div className="flex gap-1 flex-wrap">
                                                        <Badge variant="outline" className="w-fit">
                                                            {game.game_type?.type ?? "Game"}
                                                        </Badge>
                                                        {game.platforms?.map((platform) => (
                                                            <Badge key={`platform-${platform.slug}`} variant="secondary" className="w-fit">
                                                                {platform.name}
                                                            </Badge>
                                                        ))}

                                                    </div>
                                                    <h3 className="line-clamp-2 text-lg font-semibold leading-snug tracking-tight">
                                                        {game.name}
                                                    </h3>
                                                </div>

                                                <div className="mt-auto flex items-center justify-between gap-3 text-sm text-muted-foreground">
                                                    <span>Open details</span>
                                                    <FaArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </button>
                            ))}
                        </section>
                    )}
                </>
            )}
        </main>
    );
}
