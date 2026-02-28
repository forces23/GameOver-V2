"use client"

import React, { useEffect, useState } from 'react'
import { getUpcomingReleases } from '@/lib/api/igdb'
import ThemeCarousel from '@/components/info-pages/ThemeCarousel'
import { ApiError, GameData } from '@/lib/types'
import PageSkeleton from '@/components/PageSkeleton'
import PageError from '@/components/PageError'


export default function page() {
    const [releases, setReleases] = useState<GameData[]>([]);
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [error, setError] = useState<ApiError | null>(null);

    useEffect(() => {
        let active = true;

        setStatus("loading");
        const run = async () => {
            const result = await getUpcomingReleases(500);
            if(!active) return;

            if (result.ok) {
                setReleases(result.data);
                setStatus("success");
            } else {
                setStatus("error");
                setError(result.error);
            }
        }
        run();
        return () => {active = false}
    }, []);

    if (status === "loading") return <PageSkeleton />
    if (status === "error") return <PageError />

    return (
        <>
            <ThemeCarousel title='Horror' games={releases} theme='horror' />
            <ThemeCarousel title='Massive Open World' games={releases} theme='sandbox' />
            <ThemeCarousel title='Science fiction' games={releases} theme='science-fiction' />
            <ThemeCarousel title='Fantasy' games={releases} theme='fantasy' />
        </>
    )
}
