"use client"
import { Card } from '@/components/ui/card'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getUpcomingReleases } from '@/lib/api/igdb'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { formatUnixTimeToDateTime } from '@/lib/utils'
import GenreCarousel from '@/components/info-pages/GenreCarousel'
import ThemeCarousel from '@/components/info-pages/ThemeCarousel'
import { ApiError } from '@/lib/types'
import PageSkeleton from '@/components/PageSkeleton'

const url_igdb_t_original = process.env.NEXT_PUBLIC_URL_IGDB_T_ORIGINAL;

export default function page() {
    const [releases, setReleases] = useState<any[]>([]);
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [error, setError] = useState<ApiError | null>(null);


    useEffect(() => {
        setStatus("loading");
        const run = async () => {
            const result = await getUpcomingReleases(500);
            console.log(result);

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
