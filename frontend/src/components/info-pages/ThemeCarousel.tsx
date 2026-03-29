import React from 'react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '../ui/card'
import { formatUnixTimeToDateTime } from '@/lib/utils'
import { missingImg, url_igdb_t_original } from '@/lib/constants'
import { GameData } from '@/lib/types'
import { Badge } from '../ui/badge'

type ThemeProps = {
    title: string;
    games: GameData[];
    theme: string;
}

export default function ThemeCarousel({ title, games, theme }: ThemeProps) {
    return (
        <section className='w-full px-4'>
            <div className="mx-auto mb-4 flex w-full max-w-500 items-end justify-between gap-3 border-b border-border/60 pb-3">
                <div className="flex flex-col md:flex-row items-center gap-3 justify-start">
                    <h4 className="text-2xl font-semibold tracking-tight w-full md:w-auto">{title}</h4>
                    <p className="text-sm text-muted-foreground">
                        Explore games shaped by the {theme} theme and jump straight into details.
                    </p>
                </div>
                <Badge className="rounded-full border-white/20 bg-black/55 px-3 py-1 text-xs text-white shadow-sm backdrop-blur-sm">
                    {theme}
                </Badge>
            </div>
            <div className='flex justify-center'>
                <Carousel className="w-full max-w-500 pb-4">
                    <CarouselContent className="-ml-1 pt-2">
                        {games.filter((item) => item.themes?.some((t: any) => t.slug.toLowerCase() === theme)).map((game, index) => (
                            <CarouselItem key={index} className="basis-1/2 pl-1 sm:basis-1/3 md:basis-1/5 lg:basis-1/7 cursor-pointer ">
                                <Link
                                    className="group block rounded-2xl"
                                    href={`/info/game-info?gameId=${game.id}`}
                                >
                                    <Card className="py-0 overflow-hidden rounded-2xl border-border/60 bg-card/70 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                                        <div className="relative aspect-3/4 overflow-hidden">
                                            <Image
                                                src={game.cover && game.cover?.image_id ? `${url_igdb_t_original}${game.cover?.image_id}.jpg` : missingImg}
                                                alt={`theme-${game.id}`}
                                                fill
                                                sizes="(max-width: 1024px) 50vw, 14vw"
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
                                                    {game.first_release_date ? formatUnixTimeToDateTime(game.first_release_date).date : "Release unknown"}
                                                    {/* {new Date(game.first_release_date * 1000).getFullYear()} */}
                                                </Badge>
                                            )}
                                        </div>
                                        {/* <div className='flex flex-col justify-between gap-2 px-3 pb-2'>
                                            <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
                                                {game.name}
                                            </p>
                                            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                                                {game.first_release_date ? formatUnixTimeToDateTime(game.first_release_date).date : "Release unknown"}
                                            </p>
                                        </div> */}
                                    </Card>
                                </Link>
                            </CarouselItem>
                        ))}
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
