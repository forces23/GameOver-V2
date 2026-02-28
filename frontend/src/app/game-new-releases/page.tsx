"use client"

import React, { useEffect, useState } from 'react'
import { getUpcomingReleases } from '@/lib/api/igdb'
import ThemeCarousel from '@/components/info-pages/ThemeCarousel'
import { ApiError } from '@/lib/types'
import PageSkeleton from '@/components/PageSkeleton'


export default function page() {
    const [releases, setReleases] = useState<any[]>([]);
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [error, setError] = useState<ApiError | null>(null);


    useEffect(() => {
        setStatus("loading");
        const run = async () => {
            const result = await getUpcomingReleases(500);

            if (result.ok) {
                setReleases(result.data);
                setStatus("success");
            } else {
                setStatus("error");
                setError(result.error);
            }
        }
        run();
    }, []);

    if (status === "loading") return <PageSkeleton/>

    return (
        <div className='flex flex-col grow w-full max-w-500'>
            <ThemeCarousel title='Horror' games={releases} theme='horror' />
            <ThemeCarousel title='Massive Open World' games={releases} theme='sandbox' />
            <ThemeCarousel title='Science fiction' games={releases} theme='science-fiction' />
            <ThemeCarousel title='Fantasy' games={releases} theme='fantasy' />
        </div>
    )
}
