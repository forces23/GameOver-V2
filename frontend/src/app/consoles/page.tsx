"use client"

import { getAllPlatforms } from '@/lib/api/igdb';
import { ApiError, IGDBPlatformDetail } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import PageSkeleton from '@/components/PageSkeleton';
import SearchBar from '@/components/SearchBar';
import { outOfOrder, url_igdb_t_original } from '@/lib/constants';
import PageError from '@/components/PageError';

export default function page() {
    const [consoles, setConsoles] = useState<IGDBPlatformDetail[]>([]);
    const [filteredConsoles, setFilteredConsoles] = useState<IGDBPlatformDetail[]>([]);
    const [error, setError] = useState<ApiError | null>(null);
    const [status, setStatus] = useState<"loading" | "success" | "error">("success");

    useEffect(() => {
        let active = true;

        const run = async () => {
            setStatus("loading");
            const result = await getAllPlatforms();
            if (!active) return;

            if (result.ok) {
                setStatus("success");
                setConsoles(result.data);
                setFilteredConsoles(result.data)
            } else {
                setError(result.error);
                setStatus("error");
            }
        }
        run();
        return () => { active = false }
    }, []);

    if (status === "loading") return <PageSkeleton />
    if (status === "error") return <PageError />

    return (
        <div className="">
            <div className="pb-4 text-center">
                <h3 className="w-full pb-2">Consoles</h3>
                <hr />
            </div>
            <div className='mx-auto pb-4 max-w-5xl'>
                {/* TODO: need to add the onSubmitFilters function here */}
                <SearchBar originalData={consoles} setData={setFilteredConsoles} searchType='console' />
            </div>
            <div className="pb-4">
                <h5 className="w-full text-center pb-2">{filteredConsoles.length} items</h5>
                <hr className="" />
            </div>
            <section>
                <ul className='flex flex-wrap gap-3'>
                    {filteredConsoles.map((console) => (
                        <Link
                            key={`console-${console.id}-${console.slug}`}
                            href={`/info/console-info?consoleId=${console.id}`}
                            className="relative"
                        >
                            <li className="bg-background text-secondary-foreground p-2 rounded-lg w-32 cursor-pointer">
                                <div className='relative w-32 aspect-3/4 bg-gray-300 rounded-2xl'>
                                    <Image
                                        src={console.platform_logo?.image_id && console.platform_logo?.image_id !== undefined ? `${url_igdb_t_original}${console.platform_logo?.image_id}.jpg` : outOfOrder}
                                        alt={`icon-${console.id}`}
                                        fill
                                        sizes="120px"
                                        className="object-contain object-center rounded-2xl px-2"
                                    />
                                </div>
                                <span>{console.name}</span>
                            </li>
                        </Link>
                    ))}
                </ul>
            </section>
        </div>
    )
}
