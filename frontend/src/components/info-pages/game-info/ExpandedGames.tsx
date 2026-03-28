import { GameData } from '@/lib/types';
import React from 'react'
import SmallCards from '../SmallCards';
import NoContent from './NoContent';

type ExpandedGamesProps = {
    gameDetails: GameData;
    smallScreenOnlyTitle?: boolean;
}

export default function ExpandedGames({ gameDetails, smallScreenOnlyTitle = false }: ExpandedGamesProps) {
    return (
        <>
            {gameDetails?.expanded_games && gameDetails.expanded_games.length > 0 ? (
                <SmallCards title={'Expanded Games'} items={gameDetails.expanded_games} smallScreenOnlyTitle={smallScreenOnlyTitle} />
            ) : (
                <NoContent title="No Expanded Games" message="This game does not have expanded game entries available." />
            )}
        </>
    )
}
