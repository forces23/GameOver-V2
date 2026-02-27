"use client"

import { Dlc } from '@/lib/types';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import React from 'react'

type SmallCardProps = {
    title:string;
    items: Dlc[];
}

const url_igdb_t_original = process.env.NEXT_PUBLIC_URL_IGDB_T_ORIGINAL;
const outOfOrder = '/imgs/out-of-order.jpg';

export default function SmallCards({title = "", items}:SmallCardProps) {
    const router = useRouter();

    const goToDifferentGame = (id: number) => {
        router.push(`/info/game-info?gameId=${id}`)
    }

    return (
        <section>
            <h4 className="text-2xl font-semibold mb-2">{title}</h4>
            <ul className='flex flex-wrap gap-2'>
                {items.map((item) => (
                    <li
                        key={`dlc-${item.id}`}
                        className="bg-background text-secondary-foreground p-2 rounded-lg w-30 cursor-pointer"
                        onClick={() => goToDifferentGame(item.id)}
                    >
                        <div className='relative aspect-square'>
                            <Image
                                src={item.cover && item.cover?.image_id ? `${url_igdb_t_original}${item.cover?.image_id}.jpg` : outOfOrder}
                                alt={`cover-${item.id}`}
                                fill
                                sizes="120px"
                                className="rounded-lg"
                            />
                        </div>
                        <span>{item.name}</span>
                    </li>
                ))}
            </ul>
        </section>
    )
}
