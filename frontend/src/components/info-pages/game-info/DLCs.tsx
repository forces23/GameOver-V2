import { GameData } from '@/lib/types';
import React from 'react'
import SmallCards from '../SmallCards';
type DLCsProps = {
    gameDetails: GameData;
    smallScreenOnlyTitle?:boolean
}

export default function DLCs({ gameDetails, smallScreenOnlyTitle = false}: DLCsProps) {
    return (
        <>
            {gameDetails?.dlcs && gameDetails.dlcs.length > 0 && (
                <SmallCards title={'DLCs'} items={gameDetails.dlcs} smallScreenOnlyTitle={smallScreenOnlyTitle}/>
            )}
        </>
    )
}
