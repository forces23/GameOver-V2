import { GameData } from '@/lib/types'
import { formatUnixTime } from '@/lib/utils';
import React from 'react'
import InfoList from '../InfoList';

type OverviewProps = {
    gameDetails: GameData;
}

export default function Overview({ gameDetails }: OverviewProps) {
    return (
        <>
            {gameDetails?.summary &&
                <div>
                    <h2 className="text-2xl font-semibold mb-2">Summary</h2>
                    <p>{gameDetails.summary}</p>
                </div>
            }
            {gameDetails?.storyline &&
                <div>
                    <h2 className="text-2xl font-semibold mb-2">Storyline</h2>
                    <p>{gameDetails.storyline}</p>
                </div>
            }
            <div className='grid grid-cols-3 gap-2'>
                {gameDetails?.total_rating && (
                    <div>
                        <h4 className="text-2xl font-semibold mb-2">Rating:</h4>
                        {gameDetails.total_rating.toFixed(2)} ({gameDetails.total_rating_count} votes)
                    </div>
                )}
                {gameDetails?.first_release_date && (
                    <div>
                        <h4 className="text-2xl font-semibold mb-2">Release Date:</h4>
                        {formatUnixTime(gameDetails.first_release_date)}
                    </div>
                )}
                {gameDetails?.game_type?.type && (
                    <div>
                        <h4 className="text-2xl font-semibold mb-2">Game Type:</h4>
                        {gameDetails.game_type.type}
                    </div>
                )}

                {/* Franchises */}

                {gameDetails?.franchises && gameDetails.franchises.length > 0 &&
                    <InfoList title={"Franchise"} items={gameDetails.franchises} />
                }

                {/* Involved Companies */}
                {gameDetails?.involved_companies && gameDetails.involved_companies.length > 0 &&
                    <section>
                        <h4 className="text-2xl font-semibold mb-2">Involved Companies</h4>
                        <ul className='flex flex-wrap gap-2'>
                            {gameDetails.involved_companies.map((ic) => (
                                ic.company &&
                                <li key={`ic-${ic.id}`} className="bg-background text-secondary-foreground p-2 rounded-lg text-sm" >
                                    {ic.company.name} ({ic.developer ? 'Developer' : ''}{ic.publisher ? 'Publisher' : ''}{ic.porting ? 'Porting' : ''}{ic.supporting ? 'Supporting' : ''})
                                </li>
                            ))}
                        </ul>
                    </section>
                }

                {/* Platforms */}
                {gameDetails?.platforms && gameDetails.platforms.length > 0 && (
                    <InfoList title={"Platforms"} items={gameDetails.platforms} />
                )}

                {/* Genres */}
                {gameDetails?.genres && gameDetails.genres.length > 0 && (
                    <InfoList title={"Genres"} items={gameDetails.genres} />
                )}

                {/* Themes */}
                {gameDetails?.themes && gameDetails.themes.length > 0 && (
                    <InfoList title={"Themes"} items={gameDetails.themes} />
                )}

                {/* Player Perspectives */}
                {gameDetails?.player_perspectives && gameDetails.player_perspectives.length > 0 && (
                    <InfoList title={"Player Perspectives"} items={gameDetails.player_perspectives} />
                )}

                {/* Game Modes */}
                {gameDetails?.game_modes && gameDetails.game_modes.length > 0 && (
                    <InfoList title={'Game Modes'} items={gameDetails.game_modes} />
                )}
            </div>
        </>

    )
}
