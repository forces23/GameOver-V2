import React from 'react'
import { Skeleton } from './ui/skeleton'
import { Card, CardContent, CardHeader } from './ui/card'

export default function PageSkeleton() {
    return (
        <div className="flex grow w-full max-w-6xl flex-col gap-7 justify-center px-4">
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
    )
}
