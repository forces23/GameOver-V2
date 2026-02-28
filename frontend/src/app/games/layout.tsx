import PageSkeleton from '@/components/PageSkeleton'
import React, { Suspense } from 'react'

export default function layout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <div className='flex grow w-full max-w-500'>
                {children}
            </div>
        </Suspense>
    )
}
