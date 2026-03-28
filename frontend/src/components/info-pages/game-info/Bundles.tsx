import { GameData } from '@/lib/types'
import React from 'react'
import SmallCards from '../SmallCards';
import NoContent from './NoContent';

type BundlesProps = {
    gameDetails: GameData;
    smallScreenOnlyTitle?: boolean;
}

export default function Bundles({ gameDetails, smallScreenOnlyTitle = false }: BundlesProps) {
    return (
        <>
            {gameDetails?.bundles && gameDetails.bundles.length > 0 ? (
                <SmallCards title={'Bundles'} items={gameDetails.bundles} smallScreenOnlyTitle={smallScreenOnlyTitle} />
            ) : (
                <NoContent title="No Bundles" message="There are no bundle listings available for this game." />
            )}
        </>
    )
}
