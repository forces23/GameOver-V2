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
    const [wishlist, setWishlist] = useState<GameSimple[]>([]);
    const [filteredWishlist, setFilteredWishlist] = useState<GameSimple[]>([])
    const [error, setError] = useState<ApiError | null>(null);
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

    useEffect(() => {
        let active = true;

        const run = async () => {
            setStatus("loading");
            const tokenResponse = await fetch("/api/auth/token");
            const { accessToken } = await tokenResponse.json()
            if (!active) return;

            const resp = await getCollectedGames("wishlist", accessToken);
            if (!active) return;

            if (resp.ok) {
                setWishlist(resp.data.games);
                setFilteredWishlist(resp.data.games);
                setStatus("success");
            } else {
                setStatus("error");
                setError(resp.error);
            }
        }
        run();
        return () => { active = false }
    }, [])

    if (status === "loading") return <AnimatedLoading />
    if (status === "error") return <PageError />

    const favoritesCount = wishlist.filter((game) => game.favorite).length;
    const releasedCount = wishlist.filter((game) => Boolean(game.first_release_date)).length;

    return (
            <section className="flex flex-col gap-6 px-4 pb-8">
                <Card className="overflow-hidden border-0 bg-gradient-to-br from-background via-secondary/60 to-secondary shadow-none">
                    <CardHeader className="gap-3 px-6 py-6">
                        <CardTitle className="text-3xl">Wishlist</CardTitle>
                        <CardDescription className="max-w-2xl text-base">
                            Keep track of the games you want next, browse them by title, and jump straight into each game page when you are ready to revisit details.
                        </CardDescription>
                    </CardHeader>
                    {/* <CardContent className="grid gap-4 px-6 pb-6 md:grid-cols-3">
                    <StatCard
                        label="Wishlist Games"
                        value={wishlist.length}
                        description="Total titles saved for later"
                    />
                    <StatCard
                        label="Visible"
                        value={filteredWishlist.length}
                        description="Results after your current search"
                    />
                    <StatCard
                        label="Favorites"
                        value={favoritesCount}
                        description={`${releasedCount} title${releasedCount === 1 ? "" : "s"} with release dates saved`}
                    />
                </CardContent> */}
                </Card>

                <Card className="gap-4 py-5">
                    <CardHeader className="px-5">
                        <CardTitle className="text-lg">Search Wishlist</CardTitle>
                        <CardDescription>
                            Search by game title or platform without leaving your wishlist.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-5">
                        <SearchBar originalData={wishlist} setData={setFilteredWishlist} searchType='wishlist' />
                    </CardContent>
                </Card>

                {filteredWishlist.length === 0 ? (
                    <Card className="border-dashed py-8">
                        <CardHeader className="text-center">
                            <CardTitle>No matching wishlist games</CardTitle>
                            <CardDescription>
                                Try another title or platform search to bring items back into view.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {filteredWishlist.map((game: GameSimple) => {
                            const wishlistPlatforms = [...new Set(game.copies.map((copy) => copy.platform.name))];

                            return (
                                <Link
                                    key={`wishlist-${game.igdb_id}`}
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
                                                    <div className="min-w-0">
                                                        <div className="flex items-start gap-2">
                                                            <h2 className="text-xl font-semibold leading-tight">{game.name}</h2>
                                                            {game.favorite ? (
                                                                <FaStar className="mt-1 shrink-0" />
                                                            ) : (
                                                                <FaRegStar className="mt-1 shrink-0 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                        <p className="mt-1 text-sm text-muted-foreground">
                                                            {game.first_release_date
                                                                ? `Released ${formatUnixTime(game.first_release_date)}`
                                                                : "Release date not recorded"}
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        <Badge variant="secondary">Wishlist</Badge>
                                                        <Badge variant="outline">
                                                            {wishlistPlatforms.length || 0} platform{wishlistPlatforms.length === 1 ? "" : "s"}
                                                        </Badge>
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

                                                <div className="grid gap-3 md:grid-cols-[180px_1fr]">
                                                    <div className="rounded-lg bg-secondary/60 p-3">
                                                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                                            Wanted On
                                                        </p>
                                                        <p className="mt-2 text-sm font-medium">
                                                            {wishlistPlatforms.length > 0 ? wishlistPlatforms.join(", ") : "No platform saved yet"}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-lg bg-secondary/40 p-3">
                                                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                                            Quick View
                                                        </p>
                                                        <p className="mt-2 text-sm text-foreground/90">
                                                            Open this game to compare details, release timing, and decide whether it should move into your collection next.
                                                        </p>
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
            </section>
    )
}
