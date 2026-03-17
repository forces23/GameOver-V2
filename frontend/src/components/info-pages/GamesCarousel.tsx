import React from 'react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel'
import Image from 'next/image';
import { Card } from '../ui/card'
import { useRouter } from 'next/navigation';
import { AllTimeFavs, GameData, SimilarGame, UpcomingReleases } from '@/lib/types';
import Link from 'next/link';
import { v4 as uuidv4, validate as isUuid } from "uuid";
import { CgMoreO } from 'react-icons/cg';
import { missingImg, url_igdb_t_original } from '@/lib/constants';

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
            {title && (
                <h4 className="text-2xl font-semibold mb-2 cursor-pointer" onClick={() => { router.push(moreUrl) }}>{title}</h4>
            )}
            <div className='flex justify-center'>
                <Carousel className="w-full max-w-500 mb-4">
                    <CarouselContent className="-ml-1">
                        {games.map((game, index) => (
                            <CarouselItem key={index} className="basis-1/3 pl-1 sm:basis-1/4 md:basis-1/5 lg:basis-1/7 cursor-pointer">
                                <Link
                                    className=" rounded-lg"
                                    href={`/info/game-info?gameId=${game.id}`}
                                >
                                    <Card className="relative aspect-3/4" >
                                        <Image
                                            src={game.cover?.image_id != undefined ? `${url_igdb_t_original}${game.cover?.image_id}.jpg` : missingImg}
                                            alt={`game-${game.id}- ${uuidv4}`}
                                            fill
                                            sizes="(max-width: 1024px) 50vw, 20vw"
                                            className="object-cover rounded-lg"
                                        />
                                    </Card>
                                    <div className='w-full flex flex-col justify-center items-center'>
                                        <p>{game.name}</p>
                                    </div>
                                </Link>
                            </CarouselItem>
                        ))}
                        {moreActive && (
                            <CarouselItem className="basis-1/3 pl-1 sm:basis-1/4 md:basis-1/5 lg:basis-1/7 cursor-pointer ">
                                <Link
                                    className=" rounded-lg"
                                    href={moreUrl}
                                >
                                    <Card className="flex justify-center items-center relative aspect-3/4" >
                                        <div className='flex flex-col justify-center items-center' >
                                            <h3>More</h3>
                                            <CgMoreO className='text-4xl' />
                                        </div>
                                    </Card>
                                </Link>
                            </CarouselItem>
                        )}
                    </CarouselContent>
                    <CarouselPrevious variant="default" className="left-0  hover:bottom-0 text-white md:[&_svg]:!size-6 -translate-y-0 rounded-full  bg-purple-500/40 border-purple-400/60 hover:h-auto hover:top-0 hover:rounded-none hover:bg-purple-500/30 hover:text-white hover:rounded-l-md " />
                    <CarouselNext variant="default" className="right-0  bottom-0 text-white md:[&_svg]:!size-6 -translate-y-0 rounded-full  bg-purple-500/40 border-purple-400/60 hover:h-auto hover:top-0 hover:rounded-none hover:bg-purple-500/30 hover:text-white hover:rounded-r-md" />
                </Carousel>
            </div>
        </section>
    )
}
