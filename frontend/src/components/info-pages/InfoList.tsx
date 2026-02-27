import { GameMode, Genre, IGDBPlatform, PlayerPerspective, Theme } from '@/lib/types'
import React from 'react'
import { uuid } from 'zod'

type ListProps = {
    title: string;
    items: IGDBPlatform[] | Genre[] | Theme[] | PlayerPerspective[] | GameMode[];
}

export default function InfoList({ title = "", items }: ListProps) {
    return (
        <section>
            <h4 className="text-2xl font-semibold mb-2">{title}</h4>
            <ul className='flex flex-wrap gap-2'>
                {items.map((item) => (
                    <li
                        key={`item-${item.id}-${uuid}`}
                        className="bg-background text-secondary-foreground p-2 rounded-lg text-sm"
                    >
                        {item.name}
                    </li>
                ))}
            </ul>
        </section>
    )
}
