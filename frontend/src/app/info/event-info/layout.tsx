import AnimatedLoading from '@/components/AnimatedLoading'
import PageSkeleton from '@/components/PageSkeleton'
import React, { Suspense } from 'react'

export default function layout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <Suspense fallback={<AnimatedLoading />}>
            <div className="flex grow w-full pb-4 ">
                {children}
            </div>
        </Suspense>
    )
}
