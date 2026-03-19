"use client"

import AnimatedLoading from "@/components/AnimatedLoading";
import PageError from "@/components/PageError";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { getFavorites, getProfile } from "@/lib/api/db";
import { missingImg, url_igdb_t_original } from "@/lib/constants";
import { ApiError, GameSimple, Profile } from "@/lib/types";
import { useUser } from "@auth0/nextjs-auth0";
import Image from 'next/image';
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react"
import { FaEnvelope, FaGamepad, FaRegStar, FaStar } from "react-icons/fa";
import { HiOutlinePencilSquare } from "react-icons/hi2";

function StatCard({
    label,
    value,
    description,
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
    const { user } = useUser();
    const router = useRouter();
    const [profile, setProfile] = useState<Profile>();
    const [favGames, setFavGames] = useState<GameSimple[]>([]);
    const [error, setError] = useState<ApiError | null>(null);
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

    useEffect(() => {
        if (!user) return;
        let active = true;

        const run = async () => {
            setStatus("loading");

            const tokenResponse = await fetch("/api/auth/token");
            const { accessToken } = await tokenResponse.json()
            if (!active) return;

            const profileResp = await getProfile(accessToken);
            const favGamesResp = await getFavorites(accessToken);
            if (!active) return;

            if (!profileResp.ok) {
                setStatus("error");
                setError(profileResp.error);
                return;
            }

            if (!favGamesResp.ok) {
                setStatus("error");
                setError(favGamesResp.error);
                return;
            }

            setProfile(profileResp.data.data);
            setFavGames(favGamesResp.data.data);
            setStatus("success");
        }

        run()
        return () => { active = false }
    }, [user])

    if (status === "loading") return <AnimatedLoading />
    if (status === "error" || !user) return <PageError />

    const displayName = profile?.display_name || user.name || "Player";
    const avatarUrl = profile?.avatar?.public_url || user.picture || "";
    const bannerUrl = profile?.banner?.public_url || "";
    const systemsOwned = profile?.owned_systems ?? [];
    const initials = displayName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "U";

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-8">
            <Card className="overflow-hidden border-0 bg-gradient-to-br from-secondary via-secondary/75 to-background py-0 shadow-none">
                <div className="relative h-52 w-full md:h-72">
                    {bannerUrl ? (
                        <Image
                            src={bannerUrl}
                            alt="profile banner"
                            fill
                            priority
                            className="object-cover"
                        />
                    ) : (
                        <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,_hsl(var(--muted))_0%,_transparent_45%),linear-gradient(135deg,hsl(var(--secondary))_0%,hsl(var(--background))_100%)]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/35 to-transparent" />
                </div>

                <div className="relative px-6 pb-6">
                    <div className="-mt-16 flex flex-col gap-5 md:-mt-20 md:flex-row md:items-end md:justify-between">
                        <div className="flex flex-col gap-4 md:flex-row md:items-end">
                            <Avatar className="size-32 border-4 border-background shadow-lg md:size-40" size="lg">
                                <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />
                                <AvatarFallback className="text-3xl font-semibold">{initials}</AvatarFallback>
                            </Avatar>

                            <div className="flex flex-col gap-3">
                                <div>
                                    <h1 className="text-3xl font-semibold md:text-4xl">{displayName}</h1>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Personal profile and collection overview
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {profile?.email_visible && user.email && (
                                        <Badge variant="secondary">
                                            <FaEnvelope />
                                            {user.email}
                                        </Badge>
                                    )}
                                    <Badge variant="outline">
                                        <FaGamepad />
                                        {systemsOwned.length} system{systemsOwned.length === 1 ? "" : "s"} owned
                                    </Badge>
                                    <Badge variant="outline">
                                        <FaStar />
                                        {favGames.length} favorite game{favGames.length === 1 ? "" : "s"}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <Button asChild variant="outline" className="w-full md:w-auto">
                            <Link href="/user/settings">
                                <HiOutlinePencilSquare />
                                Edit Profile
                            </Link>
                        </Button>
                    </div>
                </div>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    label="Systems"
                    value={systemsOwned.length}
                    description="Platforms marked as owned on your profile"
                />
                <StatCard
                    label="Favorites"
                    value={favGames.length}
                    description="Games currently pinned as favorites"
                />
                <StatCard
                    label="Visibility"
                    value={profile?.email_visible ? "Public" : "Private"}
                    description="Whether your email is shown on the profile"
                />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <Card className="gap-4 py-5">
                    <CardHeader className="px-5">
                        <CardTitle className="text-xl">About</CardTitle>
                        <CardDescription>
                            Your public-facing profile summary.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-5">
                        <p className="text-sm leading-7 text-foreground/90">
                            {profile?.bio?.trim() || "No bio has been added yet."}
                        </p>
                    </CardContent>
                </Card>

                <Card className="gap-4 py-5">
                    <CardHeader className="px-5">
                        <CardTitle className="text-xl">Systems Owned</CardTitle>
                        <CardDescription>
                            Platforms connected to your personal collection.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-5">
                        {systemsOwned.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No systems have been added yet.
                            </p>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {systemsOwned.map((system) => (
                                    <Link
                                        key={`console-${system.id}`}
                                        href={`/info/console-info?consoleId=${system.id}`}
                                        className="group block"
                                    >
                                        <div className="rounded-xl border bg-background p-3 transition-colors group-hover:bg-accent/30">
                                            <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary/50">
                                                <Image
                                                    src={system.platform_logo?.image_id ? `${url_igdb_t_original}${system.platform_logo.image_id}.jpg` : missingImg}
                                                    alt={`system-${system.id}`}
                                                    fill
                                                    sizes="160px"
                                                    className="object-contain p-3"
                                                />
                                            </div>
                                            <p className="mt-3 line-clamp-2 text-sm font-medium leading-5">
                                                {system.name}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="gap-4 py-5">
                <CardHeader className="px-5">
                    <CardTitle className="text-xl">Favorite Games</CardTitle>
                    <CardDescription>
                        Quick access to the games you care about most.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-5">
                    {favGames.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No favorite games have been added yet.
                        </p>
                    ) : (
                        <div className='flex justify-center'>
                            <Carousel className="w-full max-w-80 sm:max-w-xl lg:max-w-5xl">
                                <CarouselContent className="-ml-2">
                                    {favGames?.map((game) => (
                                        <CarouselItem key={`favorite-${game.igdb_id}`} className="basis-1/2 pl-2 md:basis-1/3 xl:basis-1/5">
                                            <button
                                                type="button"
                                                className="block w-full text-left"
                                                onClick={() => router.push(`/info/game-info?gameId=${game.igdb_id}`)}
                                            >
                                                <Card className="gap-3 overflow-hidden py-0 transition-colors hover:bg-accent/30">
                                                    <div className="relative aspect-3/4">
                                                        <Image
                                                            src={game.cover_url}
                                                            alt={game.name}
                                                            fill
                                                            sizes="(max-width: 1024px) 50vw, 20vw"
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <CardContent className="px-3 pb-3">
                                                        <div className="flex items-start gap-2">
                                                            <p className="line-clamp-2 flex-1 text-sm font-medium leading-5">
                                                                {game.name}
                                                            </p>
                                                            <FaRegStar className="mt-0.5 shrink-0 text-muted-foreground" />
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </button>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious />
                                <CarouselNext />
                            </Carousel>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
