import React from 'react'
import Image from 'next/image';
import { outOfOrder } from '@/lib/constants';


export default function PageError() {
    return (
        <div className='flex flex-col justify-center items-center grow w-full gap-3'>
            <div className={`relative w-full max-w-150 aspect-square`}>
                <Image
                    src={outOfOrder}
                    alt={`outOfOrder-0000`}
                    fill
                    className="rounded-lg"
                />
            </div>
            <h5>Sorry about that, something went wrong please try reloading the page...</h5>
        </div>
    )
}
