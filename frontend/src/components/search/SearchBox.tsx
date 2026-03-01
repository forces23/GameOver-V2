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

const url_igdb_t_original = process.env.NEXT_PUBLIC_URL_IGDB_T_ORIGINAL;

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
                // TODO: Need to implement the console search in the backend. it was using TGDB but i removed and now backend only returns [] for consoles
                const result = await getSearchResults(gameTitle);
                if (result.ok) {
                    setSearchResults({ games: result.data.games, consoles: result.data.consoles });
                }

                // TODO: do something with errors that come back from quick search
            }
            run();
            setOpen(true);
        } else {
            // do something here later 
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
        <div className=" ">
            <div className='md:hidden'>
                <button onClick={() => setOpen(true)} className="w-fit cursor-pointer">
                    <TbSearch  size={25}/> 
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
                        <CommandGroup heading="Games">
                            {searchResults.games.map((result: any, index: number) => {
                                return (
                                    <CommandItem
                                        key={`${result.name}-${index}`}
                                        value={result.name}
                                        onSelect={() => handleSelectedGame(result.id)}
                                        className="flex items-center gap-3"
                                    >
                                        {result.cover &&
                                            <Image
                                                src={`${url_igdb_t_original}${result.cover.image_id}.jpg`}
                                                alt={`${result.name}+Cover`}
                                                height={50}
                                                width={100}
                                            />}
                                        <div className="flex flex-col">
                                            <span className="font-medium">{result.name}</span>
                                            <span className="text-xs opacity-70">
                                                {formatUnixTime(result.first_release_date)}
                                            </span>
                                        </div>
                                    </CommandItem>
                                )
                            })}
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup heading="Consoles">
                            {searchResults.consoles.map((result: any, index: number) => {
                                return (
                                    <CommandItem
                                        key={`${result.name}-${index}`}
                                        value={result.name}
                                        onSelect={() => handleSelectedConsole(result.id)}
                                        className="flex items-center gap-3"
                                    >
                                        {result.console &&
                                            <Image
                                                src={`https://cdn.thegamesdb.net/images/original/consoles/png48/${result.icon}`}
                                                alt={`${result.name}+Cover`}
                                                height={50}
                                                width={100}
                                            />}
                                        <div className="flex flex-col">
                                            <span className="font-medium">{result.name}</span>
                                            {/* <span className="text-xs opacity-70">
                                                {formatUnixTime(result.first_release_date)}
                                            </span> */}
                                        </div>
                                    </CommandItem>
                                )
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </CommandDialog>
        </div>
    )
}
