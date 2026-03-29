"use client"

import { getCollectedGames } from '@/lib/api/db';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import { formatUnixTime, getAccessToken } from '@/lib/utils';
import { ApiError, GameSimple, Genre } from '@/lib/types';
import Link from 'next/link';
import { FaRegStar, FaStar } from 'react-icons/fa';
import SearchBar from '@/components/search/SearchBar';
import PageError from '@/components/PageError';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FaPencil } from "react-icons/fa6";
import CollectedGamesDetails from '@/components/info-pages/CollectedGamesDetails';
import AnimatedLoading from '@/components/AnimatedLoading';


function StatCard({
    label,
    value,
    description
}: {
    label: string;
    value: string | number;
    description: string;
}) {
    return (
        <Card className="gap-3 py-4">
            <CardHeader className="px-4">
                <CardDescription className="text-xs font-medium uppercase tracking-[0.18em]">
                    {label}
                </CardDescription>
                <CardTitle className="text-3xl">{value}</CardTitle>
            </CardHeader>
            <CardContent className="px-4">
                <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}

export default function Page() {
    const [collection, setCollection] = useState<GameSimple[]>([]);
    const [filteredCollection, setFilteredCollection] = useState<GameSimple[]>([]);
    const [error, setError] = useState<ApiError | null>(null);
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [editingGame, setEditingGame] = useState<GameSimple | null>(null);
    const [editOpen, setEditOpen] = useState<boolean>(false);

    const run = async () => {
        setStatus("loading");

        const accessToken = await getAccessToken();
        const resp = await getCollectedGames("collected", accessToken);

        if (resp.ok) {
            setCollection(resp.data.games);
            setFilteredCollection(resp.data.games);
            setStatus("success");
        } else {
            setStatus("error");
            setError(resp.error);
        }
    }

    useEffect(() => {
        run();
    }, []);

    if (status === "loading") return <AnimatedLoading />
    if (status === "error") return <PageError />

    const totalOwnedCopies = collection.reduce(
        (sum, game) => sum + game.copies.reduce((copySum, copy) => copySum + copy.copies, 0),
        0
    );

    const favoritesCount = collection.filter((game) => game.favorite).length;

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-8">
            <Card className="overflow-hidden border-0 bg-gradient-to-br from-secondary via-secondary/80 to-background shadow-none">
                <CardHeader className="gap-3 px-6 py-6">
                    <CardTitle className="text-3xl">Owned Games</CardTitle>
                    <CardDescription className="max-w-2xl text-base">
                        Browse the games you physically or digitally own, track where they live, and jump back into detailed copy information.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 px-6 pb-6 md:grid-cols-3">
                    <StatCard
                        label="Games"
                        value={collection.length}
                        description="Total titles in your collection"
                    />
                    <StatCard
                        label="Visible"
                        value={filteredCollection.length}
                        description="Results after your current search"
                    />
                    <StatCard
                        label="Favorites"
                        value={favoritesCount}
                        description={`${totalOwnedCopies} copy${totalOwnedCopies === 1 ? "" : "ies"} logged overall`}
                    />
                </CardContent>
            </Card>

            <Card className="gap-4 py-5">
                <CardHeader className="px-5">
                    <CardTitle className="text-lg">Search Collection</CardTitle>
                    <CardDescription>
                        Search by game title or owned platform without leaving your personal library.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-5">
                    <SearchBar
                        originalData={collection}
                        setData={setFilteredCollection}
                        searchType='collection'
                    />
                </CardContent>
            </Card>

            {filteredCollection.length === 0 ? (
                <Card className="border-dashed py-8">
                    <CardHeader className="text-center">
                        <CardTitle>No matching games</CardTitle>
                        <CardDescription>
                            Try a different title or platform search to widen the results.
                        </CardDescription>
                    </CardHeader>
                </Card>
            ) : (
                <div className="grid gap-2 md:gap-4">
                    {filteredCollection.map((game: GameSimple) => {
                        const ownedPlatforms = [...new Set(game.copies.map((copy) => copy.platform.name))];
                        const copyCount = game.copies.reduce((sum, copy) => sum + copy.copies, 0);

                        return (
                            <Link
                                key={`collection-${game.igdb_id}`}
                                href={`/info/game-info?gameId=${game.igdb_id}`}
                                className="block"
                            >
                                <Card className="gap-0 overflow-hidden py-0 transition-colors hover:bg-accent/30">
                                    <div className="flex">
                                        <div className="relative w-16 shrink-0 bg-black/50 md:w-40">
                                            <Image
                                                src={game.cover_url}
                                                alt={game.name}
                                                fill
                                                sizes="(max-width: 768px) 64px, 160px"
                                                className="object-cover"
                                            />
                                        </div>

                                        <div className="flex min-w-0 flex-1 flex-col gap-2 p-3 md:gap-4 md:p-5">
                                            <div className="flex items-start justify-between gap-2 md:flex-row md:gap-3">
                                                <div className="min-w-0 w-full">
                                                    <div className="flex items-start gap-2">
                                                        <p className="line-clamp-2 w-full text-sm font-semibold leading-tight md:text-lg lg:text-2xl">
                                                            {game.name}
                                                        </p>
                                                        {game.favorite ? (
                                                            <FaStar className="mt-0.5 hidden shrink-0 md:block" />
                                                        ) : (
                                                            <FaRegStar className="mt-0.5 hidden shrink-0 text-muted-foreground md:block" />
                                                        )}
                                                    </div>
                                                    <p className="mt-1 text-[11px] text-muted-foreground md:text-sm">
                                                        Released {formatUnixTime(game.first_release_date)}
                                                    </p>
                                                </div>

                                                <div className="flex shrink-0 items-center gap-1.5 md:min-w-45 md:flex-wrap md:justify-end md:gap-2">
                                                    <Badge variant="secondary" className="px-2 py-0.5 text-[10px] md:px-2.5 md:py-1 md:text-xs">
                                                        {copyCount} cop{copyCount === 1 ? "y" : "ies"}
                                                    </Badge>
                                                    <Badge variant="outline" className="px-2 py-0.5 text-[10px] md:px-2.5 md:py-1 md:text-xs">
                                                        {ownedPlatforms.length} platform{ownedPlatforms.length === 1 ? "" : "s"}
                                                    </Badge>
                                                    <div
                                                        className="flex h-7 w-7 items-center justify-center rounded-full border border-border/70 bg-background/80"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setEditingGame(game);
                                                            setEditOpen(true)
                                                        }}
                                                    >
                                                        <FaPencil className='size-3.5 md:size-4' />
                                                    </div>
                                                </div>
                                            </div>

                                            {game.genres.length > 0 && (
                                                <div className="hidden flex-wrap gap-2 md:flex">
                                                    {game.genres.slice(0, 5).map((genre: Genre) => (
                                                        <Badge
                                                            key={`genre-${genre.id}`}
                                                            variant="outline"
                                                        >
                                                            {genre.name}
                                                        </Badge>
                                                    ))}
                                                    {game.genres.length > 5 && (
                                                        <Badge variant="outline">+{game.genres.length - 5} more</Badge>
                                                    )}
                                                </div>
                                            )}

                                            <div className="rounded-lg bg-secondary/40 px-2.5 py-2 md:hidden">
                                                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                                                    {game.copies.map((copy, index) => (
                                                        <Badge
                                                            key={`${game.igdb_id}-${copy.platform.igdb_id}-${index}`}
                                                            variant="secondary"
                                                            className="shrink-0 px-2 py-0.5 text-[10px]"
                                                        >
                                                            {copy.platform.name} x{copy.copies}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="hidden gap-3 md:grid md:grid-cols-[160px_1fr]">
                                                <div className="rounded-lg bg-secondary/60 p-3">
                                                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                                        Owned On
                                                    </p>
                                                    <p className="mt-2 text-xs md:text-sm font-medium">
                                                        {ownedPlatforms.join(", ")}
                                                    </p>
                                                </div>

                                                <div className="rounded-lg bg-secondary/40 p-3">
                                                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                                        Copy Breakdown
                                                    </p>
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {game.copies.map((copy, index) => (
                                                            <Badge
                                                                key={`${game.igdb_id}-${copy.platform.igdb_id}-${index}`}
                                                                variant="secondary"
                                                            >
                                                                {copy.platform.name} x{copy.copies}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        )
                    })}
                </div>
            )}
            <CollectedGamesDetails
                open={editOpen}
                setOpen={setEditOpen}
                mode="edit"
                existingData={editingGame}
                onSaved={run}
            />
        </div>
    )
}
