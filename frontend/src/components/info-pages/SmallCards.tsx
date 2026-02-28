"use client"

import { Dlc } from '@/lib/types';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import React from 'react'
import { outOfOrder, url_igdb_t_original } from '@/lib/constants';

type SmallCardProps = {
    title:string;
    items: Dlc[];
}

export default function SmallCards({title = "", items}:SmallCardProps) {
    const router = useRouter();

    return (
        <section>
            <h4 className="text-2xl font-semibold mb-2">{title}</h4>
            <ul className='flex flex-wrap gap-2'>
                {items.map((item) => (
                    <li
                        key={`dlc-${item.id}`}
                        className="bg-background text-secondary-foreground p-2 rounded-lg w-30 cursor-pointer"
                        onClick={() => router.push(`/info/game-info?gameId=${item.id}`)}
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
