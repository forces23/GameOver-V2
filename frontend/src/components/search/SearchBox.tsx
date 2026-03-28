"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command'
import Image from 'next/image'
import { formatUnixTime } from '@/lib/utils'
import { SearchResults } from '@/lib/types'
import { getSearchResults } from '@/lib/api/combo'
import { useRouter } from 'next/navigation'
import { TbSearch } from "react-icons/tb";
import { Kbd } from "@/components/ui/kbd"
import { missingImg, url_igdb_t_original } from '@/lib/constants'
import { gpPayload } from '@/lib/defaults'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Monitor, Gamepad2 } from 'lucide-react'
import { GiGameConsole } from "react-icons/gi";

export default function SearchBox() {
    const router = useRouter();
    const [searchResults, setSearchResults] = useState<SearchResults>({ games: [], consoles: [] });
    const [open, setOpen] = useState<boolean>(false);
    const [gameTitle, setGameTitle] = useState<string>("");
    const searchRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (gameTitle) {
            const run = async () => {
                if (!gameTitle) return;

                // contains extra field for later use if i decide to use them
                // only ones being used is query, page, limit, and sort
                const payload = {
                    ...gpPayload,
                    game: {
                        ...gpPayload.game,
                        query: gameTitle || gpPayload.game.query
                    },
                    platform: {
                        ...gpPayload.platform,
                        query: gameTitle || gpPayload.platform.query
                    }
                }

                const result = await getSearchResults(payload);
                if (result.ok) {
                    setSearchResults({ games: result.data.games, consoles: result.data.consoles });
                }
            }
            run();
            setOpen(true);
        }
    }, [gameTitle])

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const ctrl = e.ctrlKey;

            if (ctrl && e.key.toLowerCase() === "k") {
                e.preventDefault();
                searchRef.current?.click();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [])

    const handleSelectedGame = (gameId: number) => {
        router.push(`/info/game-info?gameId=${gameId}`);
        setOpen(false);
    }
    const handleSelectedConsole = (consoleId: number) => {
        router.push(`/info/console-info?consoleId=${consoleId}`);
        setOpen(false);
    }

    const totalResults = searchResults.games.length + searchResults.consoles.length;

    return (
        <div>
            <div className='md:hidden'>
                <button onClick={() => setOpen(true)} className="w-fit cursor-pointer">
                    <TbSearch size={25} />
                </button>
            </div>
            <div className='hidden md:flex'>
                <Button ref={searchRef} onClick={() => setOpen(true)} variant="outline" className="w-fit cursor-pointer">
                    <TbSearch />Search... <Kbd>Ctrl+K</Kbd>
                </Button>
            </div>

            <CommandDialog open={open} onOpenChange={setOpen} className='h-[75vh] overflow-hidden border-border/70 bg-background/95 sm:max-w-5xl'>
                <Command className='h-full'>
                    <CommandInput
                        value={gameTitle}
                        onValueChange={(value) => setGameTitle(value)}
                        placeholder="Start typing to search..." />
                    <CommandList className="max-h-none">
                        <div className="border-b border-border/60 px-4 py-3 text-sm text-muted-foreground">
                            {gameTitle.trim()
                                ? `${totalResults} result${totalResults === 1 ? "" : "s"} for "${gameTitle}"`
                                : "Search games and consoles from one place."}
                        </div>
                        <CommandEmpty className="py-10 text-center text-sm text-muted-foreground">
                            No results found for that search.
                        </CommandEmpty>
                        <CommandGroup
                            heading={`Games${searchResults.games.length ? ` (${searchResults.games.length})` : ""}`}
                            className='px-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.24em] [&_[cmdk-group-heading]]:text-muted-foreground'
                        >
                            <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
                                {searchResults.games.map((result: any, index: number) => {
                                    return (
                                        <CommandItem
                                            key={`${result.name}-${index}`}
                                            value={result.name}
                                            onSelect={() => handleSelectedGame(result.id)}
                                            className="rounded-2xl border border-transparent p-0 aria-selected:border-primary/30 aria-selected:bg-muted/60"
                                        >
                                            <Card className="flex min-h-32 w-full flex-row gap-3 overflow-hidden rounded-2xl border-border/60 bg-card/70 p-0 shadow-sm transition-colors">
                                                <div className="relative w-24 shrink-0 overflow-hidden bg-muted md:w-28">
                                                    {result.cover && result.cover.image_id !== undefined ? (
                                                        <Image
                                                            src={`${url_igdb_t_original}${result.cover.image_id}.jpg`}
                                                            alt={`${result.name} cover`}
                                                            fill
                                                            sizes="160px"
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className='flex h-full items-center justify-center bg-muted text-muted-foreground rounded-md'>
                                                            <Gamepad2 className="size-8" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
                                                    <div className="space-y-2">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <span className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                                                                {result.name}
                                                            </span>
                                                            <Badge variant="secondary" className="shrink-0 rounded-full">
                                                                Game
                                                            </Badge>
                                                        </div>
                                                        <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                                                            {result.platforms?.length
                                                                ? result.platforms.map((platform: any) => platform.name).join(", ")
                                                                : "Platform information unavailable"}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                                                        <span>
                                                            {result.first_release_date
                                                                ? formatUnixTime(result.first_release_date)
                                                                : "Release unknown"}
                                                        </span>
                                                        <span>Open game</span>
                                                    </div>
                                                </div>
                                            </Card>
                                        </CommandItem>
                                    )
                                })}
                            </div>
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup
                            heading={`Consoles${searchResults.consoles.length ? ` (${searchResults.consoles.length})` : ""}`}
                            className='px-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.24em] [&_[cmdk-group-heading]]:text-muted-foreground'
                        >
                            <div className='grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3'>
                                {searchResults.consoles.map((result: any, index: number) => {
                                    return (
                                        <CommandItem
                                            key={`${result.name}-${index}`}
                                            value={result.name}
                                            onSelect={() => handleSelectedConsole(result.id)}
                                            className="rounded-2xl border border-transparent p-0 aria-selected:border-primary/30 aria-selected:bg-muted/60"
                                        >
                                            <Card className="flex min-h-28 w-full flex-row items-center gap-3 rounded-2xl border-border/60 bg-card/70 p-3 shadow-sm transition-colors">
                                                <div className='relative aspect-square w-20 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-muted/60 via-card to-card p-3'>
                                                    {result.platform_logo?.image_id && result.platform_logo?.image_id !== undefined ? (
                                                        <Image
                                                            src={`${url_igdb_t_original}${result.platform_logo?.image_id}.jpg`}
                                                            alt={`${result.name} logo`}
                                                            fill
                                                            className='object-contain p-3'
                                                        />
                                                    ) : (
                                                        <div className='flex h-full items-center justify-center bg-muted text-muted-foreground rounded-md'>
                                                            <GiGameConsole className="size-8" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <span className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                                                            {result.name}
                                                        </span>
                                                        <Badge variant="secondary" className="shrink-0 rounded-full">
                                                            <Monitor className="size-3" />
                                                            Console
                                                        </Badge>
                                                    </div>
                                                    <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                                                        Open platform
                                                    </p>
                                                </div>
                                            </Card>
                                        </CommandItem>
                                    )
                                })}
                            </div>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </CommandDialog>
        </div>
    )
}
