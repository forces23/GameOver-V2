import ImagesCarousel from '@/components/ImagesCarousel';
import { GameData } from '@/lib/types';
import React from 'react'
import ImageDisplay from '../ImageDisplay';
import NoContent from './NoContent';

type ArtworksProps = {
    gameDetails: GameData;
    smallScreenOnlyTitle: boolean;
}

export default function Artwork({ gameDetails, smallScreenOnlyTitle = false }: ArtworksProps) {
    return (
        <div>
            {gameDetails?.artworks && gameDetails.artworks.length > 0 ? (
                <ImageDisplay title={"Artworks"} items={gameDetails.artworks} smallScreenOnlyTitle={smallScreenOnlyTitle} />
            ) : (
                <NoContent title="No Artwork" message="No artwork is available for this game." />
            )}
        </div>
    )
}
