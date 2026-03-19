import React from 'react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel'
import Image from 'next/image';
import { Card } from '../ui/card'
import Link from 'next/link';
import { v4 as uuidv4, validate as isUuid } from "uuid";
import { CgMoreO } from 'react-icons/cg';
import { missingImg, url_igdb_t_original } from '@/lib/constants';


type ConsoleCarouselProps = {
    title?: string;
    consoles: any[];
}


export default function GamesCarousel({ title = "", consoles }: ConsoleCarouselProps) {
    return (
        <section className='w-full px-4'>
            <h4 className="text-2xl font-semibold mb-2">{title}</h4>
            <div className='flex justify-center'>
                <Carousel className="w-full max-w-500 mb-4">
                    <CarouselContent className="-ml-1">
                        {consoles.map((console, index) => (
                            <CarouselItem key={index} className="basis-1/4 pl-1 sm:basis-1/6 md:basis-1/8 lg:basis-1/10 cursor-pointer">
                                <Link
                                    className=" rounded-lg"
                                    // href={`/info/console-info?consoleId=${console.id}`}
                                    href={`/games?consoles=${console.id}&page=1&limit=50&sort=total_rating_count+desc`}
                                >
                                    <Card className="relative aspect-3/4 bg-gray-300" >
                                        <Image
                                            src={console.platform_logo?.image_id != undefined ? `${url_igdb_t_original}${console.platform_logo?.image_id}.jpg` : missingImg}
                                            alt={`console-${console.slug}- ${uuidv4}`}
                                            fill
                                            sizes="(max-width: 1024px) 50vw, 20vw"
                                            className="object-contain rounded-lg px-2"
                                        />
                                    </Card>
                                    <div className='w-full flex flex-col justify-center items-center'>
                                        <p>{console.name}</p>
                                    </div>
                                </Link>
                            </CarouselItem>
                        ))}
                        <CarouselItem className="basis-1/4 pl-1 sm:basis-1/6 md:basis-1/8 lg:basis-1/10 cursor-pointer">
                            <Link
                                className=" rounded-lg"
                                href={`/consoles`}
                            >
                                <Card className="flex justify-center items-center relative aspect-3/4" >
                                    <div className='flex flex-col justify-center items-center' >
                                        <h3>More</h3>
                                        <CgMoreO className='text-4xl' />
                                    </div>
                                </Card>
                            </Link>
                        </CarouselItem>
                    </CarouselContent>
                    <CarouselPrevious variant="default" className="left-0  hover:bottom-0 text-white md:[&_svg]:!size-6 -translate-y-0 rounded-full  bg-purple-500/40 border-purple-400/60 hover:h-auto hover:top-0 hover:rounded-none hover:bg-purple-500/30 hover:text-white hover:rounded-l-md " />
                    <CarouselNext variant="default" className="right-0  bottom-0 text-white md:[&_svg]:!size-6  -translate-y-0 rounded-full  bg-purple-500/40 border-purple-400/60 hover:h-auto hover:top-0 hover:rounded-none hover:bg-purple-500/30 hover:text-white hover:rounded-r-md" />
                </Carousel>
            </div>
        </section>
    )
}
