import React from 'react'

export default function layout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <div className='flex flex-col grow w-full max-w-500'>
            {children}
        </div>
    )
}
