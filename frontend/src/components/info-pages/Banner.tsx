import React from 'react'

type BannerProps = {
    url:string;
}

export default function Banner({url}: BannerProps) {
    return (
        <div
            className={`flex w-full p-4 bg-cover bg-center justify-center rounded-lg`}
            style={{
                backgroundImage: `url("${url}")`,
                minHeight: '300px'
            }}
        ></div>
    )
}
