import React from 'react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel'
import Image from 'next/image';
import { Card } from '../ui/card'
import Link from 'next/link';
import { CgMoreO } from 'react-icons/cg';
import { missingImg, url_igdb_t_original } from '@/lib/constants';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';
import { Badge } from '../ui/badge';


type ConsoleCarouselProps = {
    title?: string;
    consoles: any[];
}


export default function GamesCarousel({ title = "", consoles }: ConsoleCarouselProps) {
    return (
        <section className='w-full px-4'>
            <div className="mx-auto mb-4 flex w-full max-w-500 items-end justify-between gap-3 border-b border-border/60 pb-3">
                <div className="space-y-1">
                    <h4 className="text-2xl font-semibold tracking-tight">{title}</h4>
                    <p className="text-sm text-muted-foreground">
                        Browse major platforms and jump into their libraries.
                    </p>
                </div>
                <Button asChild type="button" variant="ghost" className="shrink-0 rounded-full px-3 text-sm">
                    <Link href="/consoles">
                        View all
                        <ArrowRight className="size-4" />
                    </Link>
                </Button>
            </div>
            <div className='flex justify-center'>
                <Carousel className="w-full max-w-500 pb-4">
                    <CarouselContent className="-ml-1 pt-2">
                        {consoles.map((console, index) => (
                            <CarouselItem key={index} className="basis-1/4 pl-1 sm:basis-1/6 md:basis-1/8 lg:basis-1/10 cursor-pointer">
                                <Link
                                    className="group block rounded-2xl"
                                    // href={`/info/console-info?consoleId=${console.id}`}
                                    href={`/games?consoles=${console.id}&page=1&limit=50&sort=total_rating_count+desc`}
                                >
                                    <Card className="py-0 overflow-hidden rounded-2xl border-border/60 bg-card/80 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                                        <div className="relative flex aspect-4/5 items-center justify-center overflow-hidden bg-gradient-to-br from-muted/50 via-card to-card px-3">
                                            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/10 to-transparent" />
                                            <Image
                                                src={console.platform_logo?.image_id != undefined ? `${url_igdb_t_original}${console.platform_logo?.image_id}.jpg` : missingImg}
                                                alt={`console-${console.slug}`}
                                                fill
                                                sizes="(max-width: 1024px) 50vw, 20vw"
                                                className="object-contain px-3 transition-transform duration-500 group-hover:scale-105"
                                            />
                                            {console.platform_type?.name && (
                                                <Badge className="absolute left-2 top-2 rounded-full border-white/20 bg-black/55 text-[10px] text-white shadow-sm backdrop-blur-sm">
                                                    {console.platform_type.name}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className='flex  flex-col gap-2 px-3 pb-2'>
                                            <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
                                                {console.name}
                                            </p>
                                            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                                                Explore library
                                            </p>
                                        </div>
                                    </Card>
                                </Link>
                            </CarouselItem>
                        ))}
                        {/* <CarouselItem className="basis-1/4 pl-1 sm:basis-1/6 md:basis-1/8 lg:basis-1/10 cursor-pointer">
                            <Link
                                className="group block rounded-2xl"
                                href={`/consoles`}
                            >
                                <Card className="flex h-full flex-col overflow-hidden rounded-2xl border-dashed border-primary/35 bg-gradient-to-br from-primary/10 via-card to-card shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/60 group-hover:shadow-xl" >
                                    <div className="flex aspect-[4/5] items-center justify-center">
                                        <div className='flex flex-col items-center gap-3 text-center' >
                                            <div className="rounded-full border border-primary/30 bg-primary/10 p-3 text-primary">
                                                <CgMoreO className='text-4xl' />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex min-h-20 flex-col justify-between gap-2 px-3 py-3">
                                        <h3 className="text-sm font-medium leading-snug text-foreground">More</h3>
                                        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                                            Browse platforms
                                        </p>
                                    </div>
                                </Card>
                            </Link>
                        </CarouselItem> */}
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
