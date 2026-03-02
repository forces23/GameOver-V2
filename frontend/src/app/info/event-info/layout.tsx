import PageSkeleton from '@/components/PageSkeleton'
import React, { Suspense } from 'react'

export default function layout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <div className="flex grow w-full pb-4 items-center justify-center">
                {children}
            </div>
        </Suspense>
    )
}
