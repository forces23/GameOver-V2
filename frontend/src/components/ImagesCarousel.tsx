"use client"

import React, { useState } from 'react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel'
import Image from 'next/image';
import { Card } from './ui/card'
import { Artwork, Screenshot } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

const url_igdb_t_original = process.env.NEXT_PUBLIC_URL_IGDB_T_ORIGINAL;

type ImagesCarouselProps = {
    title: string;
    items: Screenshot[] | Artwork[];
}

export default function ImagesCarousel({ title = "", items }: ImagesCarouselProps) {
    const [selectedImg, setSelectedImg] = useState<string | null>("");

    return (
        <>
            <section className='w-full'>
                <h2 className="text-2xl font-semibold mb-2">{title}</h2>
                <div className='flex justify-center'>
                    <Carousel className="w-full max-w-76 sm:max-w-xs md:max-w-sm xl:max-w-6xl">
                        <CarouselContent className="-ml-1">
                            {items.map((item, index) => (
                                <CarouselItem key={index} className="basis-1/2 pl-1 lg:basis-1/3">
                                    <div className="p-1" onClick={() => { setSelectedImg(`${url_igdb_t_original}${item.image_id}.jpg`) }}>
                                        <Card
                                            className="relative aspect-video"
                                        >
                                            <Image
                                                src={`${url_igdb_t_original}${item.image_id}.jpg`}
                                                alt={`screenshot-${item.id}`}
                                                fill
                                                sizes="(max-width: 1024px) 50vw, 33vw"
                                                className="object-cover rounded-lg"
                                            />
                                        </Card>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                </div>
            </section>

            <Dialog open={!!selectedImg} onOpenChange={(open) => { if (!open) setSelectedImg(null); }}>
                <DialogTrigger asChild>
                    {/* <Button variant="outline">screenshot test</Button> */}
                </DialogTrigger>
                <DialogContent
                    showCloseButton={false}
                    className="bg-transparent border-none shadow-none p-0 flex items-center justify-center w-[95vw] h-[60vh]  lg:max-w-6xl"
                >
                    <DialogHeader className="hidden">
                        <DialogTitle>
                            Game Image
                        </DialogTitle>
                    </DialogHeader>
                    <div className="relative w-full h-full">
                        {selectedImg &&
                            <Image
                                src={selectedImg}
                                alt="image"
                                fill
                                sizes="95vw"
                                className="object-contain rounded-lg"
                            />
                        }
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
