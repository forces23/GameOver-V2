"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '@/components/ui/command'
import Image from 'next/image'
import { formatUnixTime } from '@/lib/utils'
import { SearchResults } from '@/lib/types'
import { getSearchResults } from '@/lib/api/combo'
import { useRouter } from 'next/navigation'
import { TbSearch } from "react-icons/tb";
import { Kbd } from "@/components/ui/kbd"
import { missingImg, url_igdb_t_original } from '@/lib/constants'
import { gpPayload } from '@/lib/defaults'

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
                    console.log(result.data.consoles)
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

            <CommandDialog open={open} onOpenChange={setOpen} className='sm:max-w-4xl h-[70vh]'>
                <Command className='h-full'>
                    <CommandInput
                        value={gameTitle}
                        onValueChange={(value) => setGameTitle(value)}
                        placeholder="Start typing to search..." />
                    <CommandList className="max-h-none">
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup heading="Games" className='[&_[cmdk-group-heading]]:text-xl'>
                            <div className='grid grid-cols-1 md:grid-cols-2'>
                                {searchResults.games.map((result: any, index: number) => {
                                    return (
                                        <CommandItem
                                            key={`${result.name}-${index}`}
                                            value={result.name}
                                            onSelect={() => handleSelectedGame(result.id)}
                                            className="flex items-center gap-3"
                                        >
                                            {result.cover ?
                                                <Image
                                                    src={`${url_igdb_t_original}${result.cover.image_id}.jpg`}
                                                    alt={`${result.name}+Cover`}
                                                    height={50}
                                                    width={100}
                                                />
                                                : <div className='bg-gray-300 h-[130] w-[100]'></div>
                                            }
                                            <div className="flex flex-col">
                                                <span className="font-medium">{result.name}</span>
                                                <span className="text-xs opacity-70">
                                                    {result.platforms && result.platforms.map((platform: any, index: number) => (
                                                        <span>{`${platform.name}${index < result.platforms.length - 1 ? ", " : ""}`}</span>
                                                    ))}
                                                </span>
                                                <span className="text-xs opacity-70">
                                                    {result.first_release_date && (
                                                        `Released: ${formatUnixTime(result.first_release_date)}`
                                                    )}
                                                </span>
                                            </div>
                                        </CommandItem>
                                    )
                                })}
                            </div>
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup heading="Consoles" className='[&_[cmdk-group-heading]]:text-xl'>
                            <div className='grid grid-cols-1 md:grid-cols-3'>
                                {searchResults.consoles.map((result: any, index: number) => {
                                    return (
                                        <CommandItem
                                            key={`${result.name}-${index}`}
                                            value={result.name}
                                            onSelect={() => handleSelectedConsole(result.id)}
                                            className="flex items-center gap-3"
                                        >
                                            <div className='relative bg-card-foreground rounded-2xl w-25 aspect-square px-2 py-4'>
                                                <Image
                                                    src={result.platform_logo?.image_id && result.platform_logo?.image_id !== undefined ? `${url_igdb_t_original}${result.platform_logo?.image_id}.jpg` : missingImg}
                                                    alt={`${result.name}+Cover`}
                                                    fill
                                                    className='object-contain'
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{result.name}</span>
                                            </div>
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
