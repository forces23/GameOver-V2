"use client"

import { Artwork, Screenshot } from '@/lib/types';
import React, { useState } from 'react'
import { Card } from '../ui/card';
import Image from 'next/image';
import { url_igdb_t_original } from '@/lib/constants';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

type ScreenshotsProps = {
    title?: string;
    items: Screenshot[] | Artwork[];
    smallScreenOnlyTitle?: boolean;
}

export default function ImageDisplay({ title = "", items, smallScreenOnlyTitle = false }: ScreenshotsProps) {
    const [selectedImg, setSelectedImg] = useState<string | null>("");

    return (
        <section>
            
            <h2 className={`${smallScreenOnlyTitle && "md:hidden"} text-2xl font-semibold mb-2`}>{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => (
                    <div key={`video-${item.id}`}>
                        <div className="p-1" onClick={() => { setSelectedImg(`${url_igdb_t_original}${item.image_id}.jpg`) }}>
                            <div
                                className="relative aspect-video"
                            >
                                <Image
                                    src={`${url_igdb_t_original}${item.image_id}.jpg`}
                                    alt={`screenshot-${item.id}`}
                                    fill
                                    sizes="(max-width: 1024px) 50vw, 33vw"
                                    className="object-cover rounded-lg"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

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
        </section>
    )
}


