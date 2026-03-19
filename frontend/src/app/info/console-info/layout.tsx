import AnimatedLoading from '@/components/AnimatedLoading'
import React, { Suspense } from 'react'

export default function layout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <Suspense fallback={<AnimatedLoading />}>
            <div className="flex grow w-full ">
                {children}
            </div>
        </Suspense>
    )
}
