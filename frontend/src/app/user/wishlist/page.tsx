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

            const accessToken = await getAccessToken()
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

    // const favoritesCount = wishlist.filter((game) => game.favorite).length;
    // const releasedCount = wishlist.filter((game) => Boolean(game.first_release_date)).length;

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
                <div className="grid gap-2 md:gap-4">
                    {filteredWishlist.map((game: GameSimple) => {
                        const wishlistPlatforms = [...new Set(game.copies.map((copy) => copy.platform.name))];

                        return (
                            <Link
                                key={`wishlist-${game.igdb_id}`}
                                href={`/info/game-info?gameId=${game.igdb_id}`}
                                className="block"
                            >
                                <Card className="gap-0 overflow-hidden py-0 transition-colors hover:bg-accent/30">
                                    <div className="flex">
                                        <div className="relative aspect-3/4 w-20 shrink-0 bg-black/50 md:w-36 lg:w-40">
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
                                                        {game.first_release_date
                                                            ? `Released ${formatUnixTime(game.first_release_date)}`
                                                            : "Release date not recorded"}
                                                    </p>
                                                </div>

                                                <div className="flex shrink-0 items-center gap-1.5 md:w-47 md:flex-wrap md:gap-2">
                                                    <Badge variant="secondary" className="px-2 py-0.5 text-[10px] md:px-2.5 md:py-1 md:text-xs">Wishlist</Badge>
                                                    {/* <Badge variant="outline" className="px-2 py-0.5 text-[10px] md:px-2.5 md:py-1 md:text-xs">
                                                        {wishlistPlatforms.length || 0} platform{wishlistPlatforms.length === 1 ? "" : "s"}
                                                    </Badge> */}
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

                                            {/* <div className="rounded-lg bg-secondary/40 px-2.5 py-2 md:hidden">
                                                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                                                    {wishlistPlatforms.length > 0 ? (
                                                        wishlistPlatforms.map((platform, index) => (
                                                            <Badge
                                                                key={`${game.igdb_id}-${platform}-${index}`}
                                                                variant="secondary"
                                                                className="shrink-0 px-2 py-0.5 text-[10px]"
                                                            >
                                                                {platform}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <Badge variant="outline" className="shrink-0 px-2 py-0.5 text-[10px]">
                                                            No platform saved
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div> */}

                                            <div className="hidden gap-3 md:grid md:grid-cols-[180px_1fr]">
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
