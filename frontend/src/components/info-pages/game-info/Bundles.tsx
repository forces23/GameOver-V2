import { GameData } from '@/lib/types'
import React from 'react'
import SmallCards from '../SmallCards';

type BundlesProps = {
    gameDetails: GameData;
    smallScreenOnlyTitle?: boolean;
}

export default function Bundles({ gameDetails, smallScreenOnlyTitle = false }: BundlesProps) {
    return (
        <>
            {gameDetails?.bundles && gameDetails.bundles.length > 0 && (
                <SmallCards title={'Bundles'} items={gameDetails.bundles} smallScreenOnlyTitle={smallScreenOnlyTitle} />
            )}
        </>
    )
}
