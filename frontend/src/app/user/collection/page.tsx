"use client"

import { getCollectedGames } from '@/lib/api/db';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import { formatUnixTime } from '@/lib/utils';
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

        const tokenResponse = await fetch("/api/auth/token");
        const { accessToken } = await tokenResponse.json()
        // if (!active) return;

        const resp = await getCollectedGames("collected", accessToken);
        // if (!active) return;

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
        // let active = true;
        run();
        // return () => { active = false }
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
                <div className="grid gap-4">
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
                                    <div className="flex flex-col md:flex-row">
                                        <div className="relative h-52 w-full bg-black/50 md:h-auto md:w-36 lg:w-40">
                                            <Image
                                                src={game.cover_url}
                                                alt={game.name}
                                                fill
                                                sizes="(max-width: 768px) 100vw, 160px"
                                                className="object-contain p-2"
                                            />
                                        </div>

                                        <div className="flex flex-1 flex-col gap-4 p-5">
                                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                <div className="min-w-0 w-full">
                                                    <div className="flex items-start gap-2">
                                                        <h2 className="text-xl font-semibold leading-tight w-full">{game.name}</h2>
                                                        {game.favorite ? (
                                                            <FaStar className="mt-1 shrink-0" />
                                                        ) : (
                                                            <FaRegStar className="mt-1 shrink-0 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        Released {formatUnixTime(game.first_release_date)}
                                                    </p>
                                                </div>

                                                <div className="flex flex-wrap gap-2 min-w-45 justify-end">
                                                    <Badge variant="secondary">
                                                        {copyCount} cop{copyCount === 1 ? "y" : "ies"}
                                                    </Badge>
                                                    <Badge variant="outline">
                                                        {ownedPlatforms.length} platform{ownedPlatforms.length === 1 ? "" : "s"}
                                                    </Badge>
                                                    <div onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setEditingGame(game);
                                                        setEditOpen(true)
                                                    }}>
                                                        <FaPencil className='hover:size-5' />
                                                    </div>
                                                </div>
                                            </div>

                                            {game.genres.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
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

                                            <div className="grid gap-3 md:grid-cols-[160px_1fr]">
                                                <div className="rounded-lg bg-secondary/60 p-3">
                                                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                                        Owned On
                                                    </p>
                                                    <p className="mt-2 text-sm font-medium">
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
