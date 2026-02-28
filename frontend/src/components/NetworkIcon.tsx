import React from 'react'
import Image from 'next/image';
import { getNetworkIcon } from '@/lib/utils';
import { FiGlobe } from 'react-icons/fi';

type NetworkIconProps = {
    url: string,
    name: string
}

export default function NetworkIcon({url, name}:NetworkIconProps) {
    const [failed, setFailed] = React.useState(false);

    const src = getNetworkIcon(url)
    if (failed || !src) {
        return <FiGlobe className="h-8 w-8 text-muted-foreground" aria-label={name} />;
    }

    return (
        <Image
            src={src}
            alt={`${name}`}
            width={32}
            height={32}
            onError={() => setFailed(true)}
        />
    )
}
