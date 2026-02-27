import React from 'react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '../ui/card'
import { formatUnixTimeToDateTime } from '@/lib/utils'
import { outOfOrder, url_igdb_t_original } from '@/lib/constants'
import { CgMoreO } from 'react-icons/cg'

type GenreProps = {
    title: string;
    games: any[];
    genre: string;
}

export default function GenreCarousel({title, games, genre }:GenreProps) {
    return (
        <section className='w-full px-4'>
            <h4 className="text-2xl font-semibold mb-2">{title}</h4>
            <div className='flex justify-center'>
                <Carousel className="w-full max-w-480">
                    <CarouselContent className="-ml-1">
                        {games.filter((item) => item.genres?.some((g: any) => g.name.toLowerCase() === genre)).map((game, index) => (
                            <CarouselItem key={index} className="basis-1/2 pl-1 sm:basis-1/3 md:basis-1/5 lg:basis-1/7 cursor-pointer ">
                                <Link
                                    className="p-2 rounded-lg"
                                    href={`/info/game-info?gameId=${game.id}`}
                                >
                                    <Card className="relative aspect-3/4" >
                                        <Image
                                            src={game.cover?.image_id != undefined ? `${url_igdb_t_original}${game.cover?.image_id}.jpg` : outOfOrder}
                                            alt={`genre-${game.id}`}
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
                    <CarouselPrevious className='left-2' />
                    <CarouselNext className='right-2' />
                </Carousel>
            </div>
        </section>
    )
}
