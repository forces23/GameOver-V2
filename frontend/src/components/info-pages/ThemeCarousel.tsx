import React from 'react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '../ui/card'
import { formatUnixTimeToDateTime } from '@/lib/utils'
import { outOfOrder, url_igdb_t_original } from '@/lib/constants'
import { CgMoreO } from "react-icons/cg";
import { GameData } from '@/lib/types'

type ThemeProps = {
    title: string;
    games: GameData[];
    theme: string;
}

export default function ThemeCarousel({ title, games, theme }: ThemeProps) {
    return (
        <section className='w-full px-4'>
            <h4 className="text-2xl font-semibold mb-2">{title}</h4>
            <div className='flex justify-center'>
                <Carousel className="w-full max-w-500 mb-4">
                    <CarouselContent className="-ml-1">
                        {games.filter((item) => item.themes?.some((t: any) => t.slug.toLowerCase() === theme)).map((game, index) => (
                            <CarouselItem key={index} className="basis-1/2 pl-1 sm:basis-1/3 md:basis-1/5 lg:basis-1/7 cursor-pointer ">
                                <Link
                                    className=" rounded-lg"
                                    href={`/info/game-info?gameId=${game.id}`}
                                >
                                    <Card className="relative aspect-3/4" >
                                        <Image
                                            src={game.cover && game.cover?.image_id ? `${url_igdb_t_original}${game.cover?.image_id}.jpg` : outOfOrder}
                                            alt={`theme-${game.id}`}
                                            fill
                                            sizes="(max-width: 1024px) 50vw, 14vw"
                                            className="rounded-lg"
                                        />
                                    </Card>
                                    <div className='w-full flex flex-col justify-center'>
                                        <p>{game.name}</p>
                                        <p>{formatUnixTimeToDateTime(game.first_release_date).date}</p>
                                    </div>
                                </Link>
                            </CarouselItem>
                        ))}
                        {/* <CarouselItem className="basis-1/2 pl-1 sm:basis-1/3 md:basis-1/5 lg:basis-1/7 cursor-pointer ">
                            <Link
                                className=" rounded-lg"
                                href={`/info/game-info?gameId=91`}
                            > 
                                <Card className="flex justify-center items-center relative aspect-3/4" >
                                    <div className='flex flex-col justify-center items-center' >
                                        <h3>More</h3>
                                        <CgMoreO className='text-4xl'/>
                                    </div>
                                </Card>
                            </Link>
                        </CarouselItem> */}
                    </CarouselContent>
                    <CarouselPrevious variant="default" className="left-0 top-0 bottom-0 h-auto w-10 -translate-y-0 rounded-none rounded-l-md bg-transparent hover:bg-purple-500/30 hover:text-white text-purple-500 [&_svg]:!size-6" />
                    <CarouselNext variant="default" className="right-0 top-0 bottom-0 h-auto w-10 -translate-y-0 rounded-none rounded-r-md bg-transparent hover:bg-purple-500/30 hover:text-white text-purple-500 [&_svg]:!size-6" />

                </Carousel>
            </div>
        </section>
    )
}
