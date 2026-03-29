import React from 'react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel'
import Image from 'next/image';
import { Card } from '../ui/card'
import { useRouter } from 'next/navigation';
import { GameData, SimilarGame } from '@/lib/types';
import Link from 'next/link';
import { CgMoreO } from 'react-icons/cg';
import { missingImg, url_igdb_t_original } from '@/lib/constants';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ArrowRight } from 'lucide-react';

type GamesCarouselProps = {
    title?: string;
    games: GameData[] | SimilarGame[];
    moreUrl?: string;
    moreActive?: boolean
}

export default function GamesCarousel({ title = "", games, moreUrl = "", moreActive = true }: GamesCarouselProps) {
    const router = useRouter();

    return (
        <section className='w-full px-4'>
            {(title || moreActive) && (
                <div className="mx-auto mb-2 flex w-full max-w-500 items-end justify-between gap-3 border-b border-border/60">
                    <div className="flex flex-col md:flex-row items-center gap-3 justify-start">
                        {title && (
                            <h4
                                className="text-2xl font-semibold tracking-tight cursor-pointer w-full md:w-auto"
                                onClick={() => { moreUrl && router.push(moreUrl) }}
                            >
                                {title}
                            </h4>
                        )}
                        <p className="hidden md:flex text-sm text-muted-foreground">
                            Browse standout picks and jump straight into the details.
                        </p>
                    </div>
                    {moreActive && moreUrl && (
                        <Button
                            type="button"
                            variant="ghost"
                            className="shrink-0 rounded-full px-3 text-sm"
                            onClick={() => router.push(moreUrl)}
                        >
                            View more
                            <ArrowRight className="size-4" />
                        </Button>
                    )}
                </div>
            )}
            <div className='flex justify-center'>
                <Carousel className="w-full max-w-500 pb-4">
                    <CarouselContent className="-ml-1 pt-2">
                        {games.map((game, index) => (
                            <CarouselItem key={index} className="basis-1/3 pl-1 sm:basis-1/4 md:basis-1/5 lg:basis-1/7 cursor-pointer">
                                <Link
                                    className="group block rounded-2xl"
                                    href={`/info/game-info?gameId=${game.id}`}
                                >
                                    <Card className="py-0 overflow-hidden rounded-2xl border-border/60 bg-card/70 shadow-sm transition-all duration-300 group-hover:-translate-y-1  group-hover:shadow-xl">
                                        <div className="relative aspect-3/4 overflow-hidden">
                                            <Image
                                                src={game.cover?.image_id != undefined ? `${url_igdb_t_original}${game.cover?.image_id}.jpg` : missingImg}
                                                alt={`game-${game.id}`}
                                                fill
                                                sizes="(max-width: 1024px) 50vw, 20vw"
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/85 via-black/35 to-transparent">
                                                <div className='w-full h-full flex flex-col justify-end px-2 pb-2 items-center'>
                                                    <p className="line-clamp-2 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                                                        {game.name}
                                                    </p>
                                                </div>
                                            </div>
                                            {game.first_release_date && (
                                                <Badge className="absolute right-2 top-2 rounded-full border-white/20 bg-black/55 text-[10px] text-white shadow-sm backdrop-blur-sm">
                                                    {new Date(game.first_release_date * 1000).getFullYear()}
                                                </Badge>
                                            )}
                                        </div>
                                        {/* <div className='flex  flex-col justify-between gap-2 px-3'>
                                            <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
                                                {game.name}
                                            </p>
                                            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                                                View details
                                            </p>
                                        </div> */}
                                    </Card>
                                </Link>
                            </CarouselItem>
                        ))}
                        {/* {moreActive && (
                            <CarouselItem className="basis-1/2 pl-1 sm:basis-1/4 md:basis-1/5 lg:basis-1/7 cursor-pointer">
                                <Link
                                    className="group block rounded-2xl"
                                    href={moreUrl}
                                >
                                    <Card className="flex aspect-3/4 items-center justify-center overflow-hidden rounded-2xl   bg-gradient-to-br from-primary/10 via-card to-card shadow-sm transition-all duration-300 group-hover:-translate-y-1  group-hover:shadow-xl" >
                                        <div className='flex flex-col items-center gap-3 text-center' >
                                            <div className="rounded-full border border-primary/30 bg-primary/10 p-3 text-primary">
                                                <CgMoreO className='text-4xl' />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-lg font-semibold">More</h3>
                                                <p className="text-xs text-muted-foreground">
                                                    Open the full list
                                                </p>
                                            </div>
                                        </div>

                                    </Card>
                                </Link>
                            </CarouselItem>
                        )} */}
                    </CarouselContent>
                    <CarouselPrevious
                        variant="outline"
                        className="left-2 top-[42%] h-10 w-10 -translate-y-1/2 rounded-full border-white/20 bg-black/45 text-white shadow-lg backdrop-blur-md transition hover:bg-black/65 hover:text-white md:[&_svg]:!size-6"
                    />
                    <CarouselNext
                        variant="outline"
                        className="right-2 top-[42%] h-10 w-10 -translate-y-1/2 rounded-full border-white/20 bg-black/45 text-white shadow-lg backdrop-blur-md transition hover:bg-black/65 hover:text-white md:[&_svg]:!size-6"
                    />
                </Carousel>
            </div>
        </section>
    )
}
