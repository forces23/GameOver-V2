"use client"

import { isPublicRoute } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'

export default function page() {
    const router = useRouter();

    useEffect(() => {
        const saved = sessionStorage.getItem("postLogoutPath");
        sessionStorage.removeItem("postLogoutPath");
        router.replace(saved && isPublicRoute(saved) ? saved : "/")
    }, [router]);

    return (
        <div className="flex grow"></div>
    );
}
