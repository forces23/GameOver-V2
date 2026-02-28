import { Video } from '@/lib/types';
import React from 'react'

type VideosProps = {
    title: string;
    items: Video[];
}

export default function Videos({ title = "", items }: VideosProps) {
    return (
        <section>
            <h2 className="text-2xl font-semibold mb-2">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => (
                    <div key={`video-${item.id}`}>
                        <h3 className="font-bold">{item.name}</h3>
                        <iframe
                            width="100%"
                            height="315"
                            src={`https://www.youtube.com/embed/${item.video_id}`}
                            title={item.name}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="rounded-lg"
                        ></iframe>
                    </div>
                ))}
            </div>
        </section>
    )
}
