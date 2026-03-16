'use client'

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ApiError, GameData } from '@/lib/types';
import { getGameDetails } from '@/lib/api/igdb';
import { BsBookmark, BsBookmarkCheckFill, BsCollection, BsCollectionFill } from "react-icons/bs";
import PageError from '@/components/PageError';
import PageSkeleton from '@/components/PageSkeleton';
import { useUser } from '@auth0/nextjs-auth0';
import { deleteGame, gameCheck, saveGame } from '@/lib/api/db';
import { toast, Toaster } from 'sonner';
import { formatUnixTime, getTodaysDate } from '@/lib/utils';
import { FaRegStar, FaStar } from 'react-icons/fa';
import Banner from '@/components/info-pages/Banner';
import InfoList from '@/components/info-pages/InfoList';
import SmallCards from '@/components/info-pages/SmallCards';
import ImagesCarousel from '@/components/ImagesCarousel';
import Videos from '@/components/info-pages/Videos';
import GamesCarousel from '@/components/info-pages/GamesCarousel';
import { outOfOrder, url_igdb_t_original } from '@/lib/constants';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel, FieldError } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDownIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import * as Z from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { platform } from 'os';

const formSchema = Z.object({
    rating: Z.number(),
    copies: Z.array(
        Z.object({
            platform: Z.object({
                igdb_id: Z.number(),
                slug: Z.string(),
                name: Z.string(),
            }),
            media_type: Z.string(),
            condition: Z.string(),
            purchase_date: Z.number(),
            purchase_price: Z.number(),
            storage_location: Z.string(),
            copies: Z.number(),
            copy_notes: Z.string(),
        })
    ),
    notes: Z.string(),
})

const defaultCopies = {
    platform: {
        igdb_id: 0,
        slug: "",
        name: "",
    },
    media_type: "",
    condition: "",
    purchase_date: Number(getTodaysDate().unix),
    purchase_price: 0.00,
    storage_location: "",
    copies: 0,
    copy_notes: ""
}

const defaultGameSave = {
    rating: 0,
    copies: [defaultCopies],
    notes: ""
}

type Mark = "wishlist" | "collected" | null;

export default function GameInfo() {
    const router = useRouter();
    const params = useSearchParams();
    const gameId = params.get("gameId");
    const [gameDetails, setGameDetails] = useState<GameData | null>(null);
    const [bannerBgUrl, setBannerBgUrl] = useState<string>();
    const [mark, setMark] = useState<Mark>(null);
    const [prevMark, setPrevMark] = useState<Mark>(null);
    const { user } = useUser();
    const [error, setError] = useState<ApiError | null>(null)
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [extraDetailOpen, setExtraDetailsOpen] = useState<boolean>(false);
    const [favorite, setFavorite] = useState<boolean>(false);


    const form = useForm<Z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultGameSave
    });

    const { fields: copyFields, append: appendCopies, remove: removeCopies } = useFieldArray({
        control: form.control,
        name: "copies"
    })

    const currentPath = `/info/game-info?gameId=${gameId}`;

    useEffect(() => {
        let active = true;

        const run = async () => {
            if (!gameId) {
                if (!active) return;
                setStatus("error");
                setError({ status: 400, code: "BAD_REQUEST", message: "Missing Game ID" })
                return;
            }

            setStatus("loading");
            setGameDetails(null);
            setError(null);

            const result = await getGameDetails(gameId);
            if (!active) return;

            if (result.ok) {
                setGameDetails(result.data);
                setStatus("success");
            } else {
                setError(result.error);
                setStatus("error");
            }
        };

        run();
        return () => { active = false }
    }, [gameId]);

    useEffect(() => {
        if (!gameDetails) return;

        // check if game is in users collection 
        const gameColCheck = async () => {
            // Fetch access token from Auth0
            const tokenResponse = await fetch('/api/auth/token');
            const { accessToken } = await tokenResponse.json();

            const resp = await gameCheck(gameDetails.id, accessToken)

            setFavorite(resp.data.data.favorite);
            if (resp.data.data.collected) setMark("collected");
            else if (resp.data.data.wishlist) setMark("wishlist");
            else setMark(null);
        }
        if (user) gameColCheck();


        if (gameDetails.artworks && gameDetails.artworks.length > 0) {
            setBannerBgUrl(`${url_igdb_t_original}${gameDetails['artworks'][0]['image_id']}.jpg`);
        } else if (gameDetails.screenshots && gameDetails.screenshots?.length > 0) {
            setBannerBgUrl(`${url_igdb_t_original}${gameDetails['screenshots'][0]['image_id']}.jpg`);
        } else setBannerBgUrl("") // TODO:should have a default image here 
    }, [gameDetails])

    const saveToWishlist = async () => {
        if (!gameDetails) return;
        if (!user) {
            window.location.href = `/auth/login?returnTo=${encodeURIComponent(currentPath)}`;
            return;
        }

        const runWishlist = (async () => {
            // Fetch access token from Auth0
            const tokenResponse = await fetch('/api/auth/token');
            const { accessToken } = await tokenResponse.json();

            const resp = await saveGame(gameDetails, null, accessToken, false, true);
            if (!resp.ok) throw new Error("Save Failed!");
            return { action: "added to", target: "wishlist" }
        })();

        toast.promise(runWishlist, {
            loading: `Adding to wishlist`,
            success: ({ action, target }) => `Game ${action} ${target}`,
            error: "Failed to add game to wishlist"
        });

        try {
            await runWishlist;
        } catch (error) {
            // TODO: DO SOMETHING
        }
    }

    const saveToCollection = async (values: Z.infer<typeof formSchema>) => {
        if (!gameDetails) return;
        if (!user) {
            window.location.href = `/auth/login?returnTo=${encodeURIComponent(currentPath)}`;
            return;
        }

        const run = (async () => {
            // Fetch access token from Auth0
            const tokenResponse = await fetch('/api/auth/token');
            const { accessToken } = await tokenResponse.json();

            // save to collection 
            // add extra details to send to the backend on the backend if empty then just ignore it
            const resp = await saveGame(gameDetails, values, accessToken, true, false);
            if (!resp.ok) throw new Error("Save Failed!");
            return { action: "added to", target: mark }
        })();

        toast.promise(run, {
            loading: `Adding to collection`,
            success: ({ action, target }) => `Game ${action} ${target}`,
            error: "Failed to add game to collection"
        });

        try {
            await run;
        } catch (error) {
            setMark(prevMark);
            console.log("Mark Reversed")
        } finally {
            setExtraDetailsOpen(false);
        }
    }

    const deleteFromCollection = async () => {
        if (!gameDetails) return;
        if (!user) {
            window.location.href = `/auth/login?returnTo=${encodeURIComponent(currentPath)}`;
            return;
        }

        const run = (async () => {
            // Fetch access token from Auth0
            const tokenResponse = await fetch('/api/auth/token');
            const { accessToken } = await tokenResponse.json();

            // delete from collection
            const resp = await deleteGame(gameDetails.id, accessToken)
            if (!resp.ok) throw new Error("Delete Failed!");
            return { action: "removed from", target: mark }
        })();

        toast.promise(run, {
            loading: `Removing game`,
            success: ({ action, target }) => `Game ${action} ${target}`,
            error: `Failed remove game`
        });

        try {
            await run;
        } catch (error) {
            setMark(prevMark);
        }
    }

    const handleFavorites = async () => {
        if (!gameDetails) return;
        if (!user) {
            window.location.href = `/auth/login?returnTo=${encodeURIComponent(currentPath)}`;
            return;
        }

        const favState = !favorite
        setFavorite(favState);

        const runFav = (async () => {
            // Fetch access token from Auth0 --- TODO: Need to make this happen one time per page for user logged in 
            const tokenResponse = await fetch('/api/auth/token');
            const { accessToken } = await tokenResponse.json();

            if (!favState && mark === null) {
                // delete and set mark to null
                // const resp = await deleteGame(gameDetails.id, accessToken)
                // if (!resp.ok) throw new Error("Delete Failed!");
                deleteFromCollection();
                return { action: "removed from", target: "your collection" }
            } else {
                const resp = await saveGame(gameDetails, null, accessToken, mark === "collected", mark === "wishlist", favState);
                if (!resp.ok) throw new Error("Save Failed!");
                return { action: `${favState ? "added to" : "removed from"}`, target: "favorites" }

            }
        })();

        toast.promise(runFav, {
            loading: `Adding to favorites`,
            success: ({ action, target }) => `Game ${action} ${target}`,
            error: "Failed to update game status"
        });

        try {
            await runFav;
        } catch (error) {
            setFavorite(!favState);
        }
    }


    const handleSave = (next: Exclude<Mark, null>) => {
        setPrevMark(mark);
        const newMark = (mark === next ? null : next);
        setMark(newMark);

        if (newMark === "collected") {
            setExtraDetailsOpen(true);
        } else if (newMark === "wishlist") {
            saveToWishlist();
        } else {
            deleteFromCollection();
        }
    }

    if (status === "loading") return <PageSkeleton />;
    if (status === "error") return <PageError />;
    // TODO: future change for error page
    // if (status === "error") return <PageError code={error?.code} message={error?.message} />; 

    return (
        <main className="flex w-full flex-col ">
            <Toaster />
            <div className='flex flex-col gap-4 p-4'>
                {/* Banner Image */}
                {bannerBgUrl &&
                    <Banner url={bannerBgUrl} />
                }

                {/* Game Details */}
                <div className='bg-secondary p-3 rounded-xl'>
                    {/* Game Title */}
                    {gameDetails?.name &&
                        <div className='flex justify-between'>
                            <h1 className='ps-6 text-4xl text-center font-bold w-full justify-center flex'>{gameDetails.name}</h1>
                            <div className="flex gap-3 pe-3">
                                <span
                                    onClick={() => { handleSave("wishlist") }}
                                    className='md:text-2xl'>
                                    {mark === "wishlist" ?
                                        <BsBookmarkCheckFill /> : <BsBookmark />
                                    }
                                </span>
                                <span
                                    // onClick={() => { handleMark("collected") }}
                                    onClick={() => { handleSave("collected") }}
                                    className='md:text-2xl'>
                                    {mark === "collected" ?
                                        <BsCollectionFill /> : <BsCollection />
                                    }
                                </span>
                                <span onClick={() => { handleFavorites() }} className='md:text-2xl'>
                                    {favorite ?
                                        <FaStar /> : <FaRegStar />
                                    }
                                </span>
                            </div>

                        </div>
                    }

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
                        <aside className="col-span-1 flex flex-col gap-4">
                            {/* Cover Image */}
                            {gameDetails?.cover &&
                                <div className='relative h-96 w-full'>
                                    <Image
                                        src={gameDetails.cover?.image_id && gameDetails.cover?.image_id !== undefined ? `${url_igdb_t_original}${gameDetails.cover?.image_id}.jpg` : outOfOrder}
                                        alt={`${gameDetails.name} cover art`}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        className="object-contain"
                                    />
                                </div>
                            }

                            {gameDetails?.rating && (
                                <div>
                                    <strong>Rating:</strong>
                                    {gameDetails.rating.toFixed(2)} ({gameDetails.rating_count} votes)
                                </div>
                            )}
                            {gameDetails?.total_rating && (
                                <div>
                                    <strong>Total Rating:</strong>
                                    {gameDetails.total_rating.toFixed(2)} ({gameDetails.total_rating_count} votes)
                                </div>
                            )}
                            {gameDetails?.first_release_date && (
                                <div>
                                    <strong>Release Date:</strong>
                                    {formatUnixTime(gameDetails.first_release_date)}
                                </div>
                            )}
                            {gameDetails?.game_type?.type && (
                                <div>
                                    <strong>Game Type:</strong>
                                    {gameDetails.game_type.type}
                                </div>
                            )}

                            {/* Franchises */}
                            {gameDetails?.franchises && gameDetails.franchises.length > 0 &&
                                <section>
                                    <strong>Franchises</strong>
                                    <ul className='flex flex-wrap gap-2'>
                                        {gameDetails.franchises.map((franchise) => (
                                            <li key={`franchise-${franchise.id}`} className="bg-background text-secondary-foreground p-2 rounded-lg">{franchise.name}</li>
                                        ))}
                                    </ul>
                                </section>
                            }

                            {/* Involved Companies */}
                            {
                                gameDetails?.involved_companies && gameDetails.involved_companies.length > 0 &&
                                <section>
                                    <strong>Involved Companies</strong>
                                    <ul className='flex flex-wrap gap-2'>
                                        {gameDetails.involved_companies.map((ic) => (
                                            ic.company &&
                                            <li key={`ic-${ic.id}`} className='bg-background px-3 gap-2 rounded-xl' >
                                                {ic.company.name} ({ic.developer ? 'Developer' : ''}{ic.publisher ? 'Publisher' : ''}{ic.porting ? 'Porting' : ''}{ic.supporting ? 'Supporting' : ''})
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            }
                        </aside>

                        <section className="col-span-2 flex flex-col gap-4">
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
                            <div className='grid grid-cols-2'>
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

                            {/* DLCs */}
                            {gameDetails?.dlcs && gameDetails.dlcs.length > 0 && (
                                <SmallCards title={'DLCs'} items={gameDetails.dlcs} />
                            )}

                            {/* Bundles */}
                            {gameDetails?.bundles && gameDetails.bundles.length > 0 && (
                                <SmallCards title={'Bundles'} items={gameDetails.bundles} />
                            )}

                            {/* Expanded Games */}
                            {gameDetails?.expanded_games && gameDetails.expanded_games.length > 0 && (
                                <SmallCards title={'Expanded Games'} items={gameDetails.expanded_games} />
                            )}
                        </section>
                    </div>
                </div>

                {/* Screenshots */}
                {gameDetails?.screenshots && gameDetails.screenshots.length > 0 && (
                    <ImagesCarousel title={"Screenshots"} items={gameDetails.screenshots} />
                )}

                {/* Artworks */}
                {gameDetails?.artworks && gameDetails.artworks.length > 0 && (
                    <ImagesCarousel title={"Artworks"} items={gameDetails.artworks} />
                )}

                {/* Videos */}
                {gameDetails?.videos && gameDetails.videos.length > 0 && (
                    <Videos title={"Videos"} items={gameDetails.videos} />
                )}

                {/* Similar Games */}
                {gameDetails?.similar_games && gameDetails.similar_games.length > 0 && (
                    <GamesCarousel title='Similar Games' games={gameDetails.similar_games} moreActive={false} />
                )}

                {/* Websites */}
                {gameDetails?.websites && gameDetails.websites.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-semibold mb-2">Related Websites</h2>
                        <ul className='flex flex-wrap gap-2'>
                            {gameDetails.websites.map((site, index) => (
                                site.url && site.type &&
                                <li key={`site-${site.id}`}>
                                    <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                        {site.type.type}
                                    </a>
                                    {gameDetails.websites && index < gameDetails.websites.length - 1 && " |"}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

            </div >
            {/* EXTRA DETAILS DIALOG */}
            <Dialog open={extraDetailOpen}>
                <DialogContent className="sm:max-w-2xl ">
                    <form id='form-extra-save-details' onSubmit={form.handleSubmit(saveToCollection)}>
                        <DialogHeader>
                            <DialogTitle>Extra Details</DialogTitle>
                            <DialogDescription>
                                Add additional details and copies here for this game
                            </DialogDescription>
                        </DialogHeader>
                        <div className='no-scrollbar overflow-y-auto -mx-4 max-h-[75vh] bg-card p-2 rounded-2xl'>
                            <FieldGroup className='grid grid-cols-2 md:grid-cols-3'>
                                <Controller
                                    name='rating'
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel>Rating</FieldLabel>
                                            <Select
                                                value={String(field.value)}
                                                onValueChange={(value) => field.onChange(Number(value))}
                                            >
                                                <SelectTrigger >
                                                    <SelectValue placeholder={<><FaRegStar /><FaRegStar /><FaRegStar /><FaRegStar /><FaRegStar /></>} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectLabel>Rating</SelectLabel>
                                                        <SelectItem value="1"><FaStar /><FaRegStar /><FaRegStar /><FaRegStar /><FaRegStar /></SelectItem>
                                                        <SelectItem value="2"><FaStar /><FaStar /><FaRegStar /><FaRegStar /><FaRegStar /></SelectItem>
                                                        <SelectItem value="3"><FaStar /><FaStar /><FaStar /><FaRegStar /><FaRegStar /></SelectItem>
                                                        <SelectItem value="4"><FaStar /><FaStar /><FaStar /><FaStar /><FaRegStar /></SelectItem>
                                                        <SelectItem value="5"><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />
                            </FieldGroup>
                            <div className='py-4'>
                                {copyFields.map((copy, index) => (
                                    <div key={copy.id}>
                                        <FieldGroup className='grid grid-cols-2 md:grid-cols-3'>
                                            <Controller
                                                name={`copies.${index}.platform`}
                                                control={form.control}
                                                render={({ field }) => (
                                                    <Field>
                                                        <FieldLabel>Game Platform</FieldLabel>
                                                        <Select value={`${field.value?.igdb_id}`} onValueChange={(id) => {
                                                            const selectedPlatform = gameDetails?.platforms?.find(
                                                                (platform) => String(platform.id) === id
                                                            );

                                                            if (!selectedPlatform) return;

                                                            field.onChange({
                                                                igdb_id: selectedPlatform.id,
                                                                slug: selectedPlatform.slug,
                                                                name: selectedPlatform.name
                                                            });
                                                        }}>
                                                            <SelectTrigger >
                                                                <SelectValue placeholder="Select Game Platform" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectGroup>
                                                                    <SelectLabel>Game Platform</SelectLabel>
                                                                    {gameDetails?.platforms?.map((platform, index) => (
                                                                        <SelectItem key={`${platform.slug}-${platform.id}`} value={`${platform.id}`}>{platform.name}</SelectItem>
                                                                    ))}
                                                                </SelectGroup>
                                                            </SelectContent>
                                                        </Select>
                                                    </Field>
                                                )}
                                            />
                                            <Controller
                                                name={`copies.${index}.media_type`}
                                                control={form.control}
                                                render={({ field }) => (
                                                    <Field>
                                                        <FieldLabel>Media Type</FieldLabel>
                                                        <Select value={field.value} onValueChange={field.onChange}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select Media Type" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectGroup>
                                                                    <SelectLabel>Media Type</SelectLabel>
                                                                    <SelectItem value="digital">Digital</SelectItem>
                                                                    <SelectItem value="cib">CIB</SelectItem>
                                                                    <SelectItem value="media-only">Media Only</SelectItem>
                                                                    <SelectItem value="incomplete">Incomplete</SelectItem>
                                                                    <SelectItem value="factory-sealed">Factory Sealed</SelectItem>
                                                                    <SelectItem value="graded">Graded</SelectItem>
                                                                </SelectGroup>
                                                            </SelectContent>
                                                        </Select>
                                                    </Field>
                                                )}
                                            />
                                            <Controller
                                                name={`copies.${index}.condition`}
                                                control={form.control}
                                                render={({ field }) => (
                                                    <Field>
                                                        <FieldLabel>Condition</FieldLabel>
                                                        <Select value={field.value} onValueChange={field.onChange}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select Condition" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectGroup>
                                                                    <SelectLabel>Condition</SelectLabel>
                                                                    <SelectItem value="mint">Mint</SelectItem>
                                                                    <SelectItem value="excellent">Excellent</SelectItem>
                                                                    <SelectItem value="good">Good</SelectItem>
                                                                    <SelectItem value="fair">Fair</SelectItem>
                                                                    <SelectItem value="poor">Poor</SelectItem>
                                                                </SelectGroup>
                                                            </SelectContent>
                                                        </Select>
                                                    </Field>
                                                )}
                                            />
                                            <Controller
                                                name={`copies.${index}.purchase_date`}
                                                control={form.control}
                                                render={({ field }) => (
                                                    <Field>
                                                        <FieldLabel>Purchase Date</FieldLabel>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    data-empty={!field.value}
                                                                    className="w-[212px] justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                                                                >
                                                                    {field.value ? format(new Date(field.value * 1000), "PPP") : <span>Pick a date</span>}
                                                                    <ChevronDownIcon />
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0" align="start">
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={field.value ? new Date(field.value * 1000) : undefined}
                                                                    defaultMonth={field.value ? new Date(field.value * 1000) : undefined}
                                                                    onSelect={(date) =>
                                                                        field.onChange(date ? Math.floor(date.getTime() / 1000) : 0)
                                                                    }
                                                                />

                                                            </PopoverContent>
                                                        </Popover>
                                                    </Field>
                                                )}
                                            />
                                            <Field>
                                                <FieldLabel>Purchase Price</FieldLabel>
                                                <div className="relative">
                                                    <span className="pointer-events-none absolute left-1 top-4 -translate-y-1/2 text-muted-foreground">
                                                        $
                                                    </span>

                                                    <Input {...form.register(`copies.${index}.purchase_price`, { valueAsNumber: true })} type="number" step={0.01} min={0} placeholder="$0.00" className='ps-4 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none' />
                                                </div>
                                            </Field>
                                            <Field>
                                                <FieldLabel>Storage Location</FieldLabel>
                                                <Input {...form.register(`copies.${index}.storage_location`)} placeholder="Room A / Shelf 2 / Bin 4" />
                                            </Field>

                                            <Field>
                                                <FieldLabel>Copies</FieldLabel>
                                                <Input {...form.register(`copies.${index}.copies`, { valueAsNumber: true })} type="number" placeholder="1" className='[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none' />
                                            </Field>
                                            <Field className='col-span-2 md:col-span-3'>
                                                <FieldLabel>Game Copy Notes</FieldLabel>
                                                <Textarea {...form.register(`copies.${index}.copy_notes`)} placeholder="Type your message here." />
                                            </Field>
                                            {(copyFields.length > 1) && (
                                                <Button type="button" className='col-span-2 md:col-span-3 ' variant="destructive" onClick={() => removeCopies(index)}>Remove Copy</Button>
                                            )}
                                        </FieldGroup>
                                        {(copyFields.length > 1 && index < copyFields.length - 1) && (<hr className='my-4' />)}
                                    </div>

                                ))}
                            </div>
                            <FieldGroup className=''>
                                <div className='flex justify-end'>
                                    <Button type="button" variant="outline" onClick={() => appendCopies({ ...defaultCopies, platform: { ...defaultCopies.platform } })}>Add Copy</Button>
                                </div>
                            </FieldGroup>
                            <FieldGroup className='grid grid-cols-2 md:grid-cols-3'>
                                <Controller
                                    name="notes"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field className='col-span-2 md:col-span-3'>
                                            <FieldLabel htmlFor="notes_1">Notes</FieldLabel>
                                            <Textarea value={field.value} onChange={field.onChange} placeholder="Type your message here." />
                                            {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                                        </Field>

                                    )}
                                />
                            </FieldGroup>
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setExtraDetailsOpen(false);
                                        setMark(null)
                                    }}
                                >
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit">Save Game</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </main >
    )
}
