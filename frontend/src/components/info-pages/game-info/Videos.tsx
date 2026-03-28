import { GameData } from '@/lib/types'
import React from 'react'
import VideosDisplay from '../VideosDisplay';
import NoContent from './NoContent';

type VideosProps = {
    gameDetails: GameData;
    smallScreenOnlyTitle?: boolean;
}

export default function Videos({ gameDetails, smallScreenOnlyTitle = false }: VideosProps) {
    return (
        <div>
            {gameDetails?.videos && gameDetails.videos.length > 0 ? (
                <VideosDisplay title={"Videos"} items={gameDetails.videos} smallScreenOnlyTitle={smallScreenOnlyTitle} />
            ) : (
                <NoContent title="No Videos" message="No videos are available for this game." />
            )}
        </div>
    )
}
