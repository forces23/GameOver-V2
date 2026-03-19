import React from 'react'
import { Skeleton } from './ui/skeleton'

export default function PageSkeleton() {
    return (
        <div className='flex w-full grow justify-center items-center'>
            <div className="flex w-full max-w-6xl flex-col gap-7 px-4">
                <div className="flex flex-col gap-3">
                    <Skeleton className="h-8 w-2/3" />
                    <Skeleton className="h-20 w-full" />
                </div>
                <div className="flex flex-col gap-3">
                    <Skeleton className="h-8 w-2/3" />
                    <Skeleton className="h-20 w-full" />
                </div>
                <div className="flex flex-col gap-3">
                    <Skeleton className="h-8 w-2/3" />
                    <Skeleton className="h-20 w-full" />
                </div>
            </div>
        </div>
    )
}
