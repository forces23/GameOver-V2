"use client"

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useEffect, useState, useRef } from "react";
import { ButtonGroup } from "@/components/ui/button-group"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { formatUnixTime } from "@/utils/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { getQuickSearchInfo } from "@/lib/api/igdb";

const url_igdb_t_original = process.env.NEXT_PUBLIC_URL_IGDB_T_ORIGINAL

export default function SearchBar() {
    const [gameTitle, setGameTitle] = useState("");
    const [searchResults, setSearchResults] = useState([]); // have ai create the type for searchResults
    const router = useRouter();
    const searchRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutsideSearch = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutsideSearch);
        return () => {
            document.removeEventListener("mousedown", handleClickOutsideSearch);
        };
    }, []);

    useEffect(() => {
        if (gameTitle) {
            const fetchGameDetails = async () => {
                if (!gameTitle) return;
                const qsData = await getQuickSearchInfo(gameTitle);
                setSearchResults(qsData);
            }
            fetchGameDetails();
            setOpen(true);
        } else {
            setOpen(false)
        }

    }, [gameTitle])

    const searchGame = (e: ChangeEvent<HTMLInputElement>) => {
        setGameTitle(e.target.value)
    }

    const handleSelectedGame = (gameId: number) => {
        router.push(`/game-info?gameId=${gameId}`);
        setOpen(false);
    }

    return (
        <>
            <div className="relative w-full " ref={searchRef}>
                <Field>
                    <ButtonGroup>
                        <Input
                            id="input-button-group"
                            placeholder="Type to search..."
                            onChange={(e) => searchGame(e)}
                            value={gameTitle}
                            onFocus={() => { setOpen(true) }} />
                    </ButtonGroup>
                </Field>

                {open && searchResults.length > 0 && gameTitle &&
                    (
                        <Command className="absolute flex  top-full mt-1 w-full h-auto rounded-lg border bg-background shadow-lg z-10">
                            <CommandList className="max-h-80 overflow-y-auto" >
                                <CommandEmpty>No results found.</CommandEmpty>
                                <CommandGroup heading="Suggestions">
                                    {searchResults.map((result: any, index: number) => {
                                        return (
                                            <CommandItem
                                                key={`${result.name}-${index}`}
                                                value={result.name}
                                                onSelect={() => handleSelectedGame(result.id)}
                                                className="flex items-center gap-3 "
                                            >
                                                {result.cover && <Image src={`${url_igdb_t_original}${result.cover.image_id}.jpg`} alt={`${result.name}+Cover`} height={50} width={100} />}
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
                            </CommandList>
                        </Command>
                    )}
            </div>
        </>
    );
}
