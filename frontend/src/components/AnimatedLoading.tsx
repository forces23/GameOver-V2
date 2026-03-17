import React from 'react'
import Image from 'next/image'


export default function AnimatedLoading() {
    return (
        <div className='flex flex-col items items-center justify-center'>
            <Image
                src={"/imgs/animated/sonicandtailsrun.gif"}
                alt="sonic and tails running..."
                height={250}
                width={250}
            />
            <span className='bold text-2xl'>
                Loading...
            </span>
        </div>
    )
}
