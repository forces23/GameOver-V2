import AnimatedLoading from '@/components/AnimatedLoading'
import React, { Suspense } from 'react'

export default function layout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <Suspense fallback={<AnimatedLoading />}>
            <div className='flex grow w-full max-w-500 '>
                {children}
            </div>
        </Suspense>
    )
}
