import ImagesCarousel from '@/components/ImagesCarousel'
import { GameData } from '@/lib/types';
import React from 'react'
import ImageDisplay from '../ImageDisplay';
import NoContent from './NoContent';

type ScreenshotsProps = {
    gameDetails: GameData;
    smallScreenOnlyTitle?: boolean;
}

export default function Screenshots({ gameDetails, smallScreenOnlyTitle = false }: ScreenshotsProps) {
    return (
        <>
            {gameDetails?.screenshots && gameDetails.screenshots.length > 0 ? (
                <ImageDisplay title={"Screenshots"} items={gameDetails.screenshots} smallScreenOnlyTitle={smallScreenOnlyTitle} />
            ) : (
                <NoContent title="No Screenshots" message="No screenshots are available for this game." />
            )}
        </>
    )
}
