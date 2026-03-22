
import React, { useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { ChevronDownIcon } from 'lucide-react';
import { FaRegStar, FaStar } from 'react-icons/fa';
import { FieldGroup, Field, FieldLabel, FieldError, FieldDescription } from '../ui/field';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { SelectContent, SelectLabel, SelectTrigger, SelectValue, SelectGroup, SelectItem, Select } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { Input } from '../ui/input';
import * as Z from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { getAccessToken, getTodaysDate, toTitleCase } from '@/lib/utils';
import { saveGame } from '@/lib/api/db';
import { toast } from 'sonner';
import { GameData, GameSimple, IGDBPlatform, Mark } from '@/lib/types';
import { useUser } from '@auth0/nextjs-auth0';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import axios from 'axios';
import { ep_game_details, url_omega } from '@/lib/constants';
import { getGameDetails } from '@/lib/api/igdb';


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
            upc: Z.string(),
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
    upc: "",
    storage_location: "",
    copies: 1,
    copy_notes: ""
}

const defaultGameSave = {
    rating: 0,
    copies: [defaultCopies],
    notes: ""
}



type CollectedGamesDetailsProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    gameDetails?: GameData | null;
    mode: "create" | "edit";
    existingData?: GameSimple | null;
    onSaved?: () => Promise<void> | void;
    onCancel?: () => void;
}

export default function CollectedGamesDetails({
    open,
    setOpen,
    gameDetails,
    mode,
    existingData,
    onSaved,
    onCancel,
}: CollectedGamesDetailsProps) {
    const { user } = useUser();
    const currentPath = `${window.location.pathname}${window.location.search}`;
    const [gameData, setGameData] = useState<GameData>();
    const [platforms, setPlatforms] = useState<IGDBPlatform[]>([]);
    const skipCancelRef = useRef(false);
    const form = useForm<Z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultGameSave
    });

    const { fields: copyFields, append: appendCopies, remove: removeCopies } = useFieldArray({
        control: form.control,
        name: "copies"
    })
    const watchedCopies = form.watch("copies");
    const watchedRating = form.watch("rating");

    const saveToCollection = async (values: Z.infer<typeof formSchema>) => {
        let data = null
        if (!gameDetails && !gameData) return;
        if (!gameDetails) data = gameData
        else if (!gameData) data = gameDetails
        if (!data) return;
        if (!user) {
            window.location.href = `/auth/login?returnTo=${encodeURIComponent(currentPath)}`;
            return;
        }

        const run = (async () => {
            const accessToken = await getAccessToken();

            // save to collection 
            // add extra details to send to the backend on the backend if empty then just ignore it
            const resp = await saveGame(data, values, accessToken, true, false);
            if (!resp.ok) throw new Error("Save to collection failed!");
            return { action: "added to", target: "collection"}
        })();

        toast.promise(run, {
            loading: `Adding to collection`,
            success: ({ action, target }) => `Game ${action} ${target}`,
            error: "Failed to add game to collection"
        });

        try {
            await run;
        } catch (error) {
            throw new Error("Save Failed");
        } finally {
            skipCancelRef.current = true;
            setOpen(false);
        }
    }

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && !skipCancelRef.current) {
            onCancel?.();
        }

        if (skipCancelRef.current) {
            skipCancelRef.current = false;
        }

        setOpen(nextOpen);
    }

    useEffect(() => {
        if (mode === "create") {
            form.reset(defaultGameSave);
            gameDetails?.platforms && setPlatforms(gameDetails.platforms);
        } else if (mode === "edit") {
            form.reset({
                "rating": existingData?.rating,
                "notes": existingData?.notes,
                "copies": existingData?.copies
            });

            const run = async () => {
                const result = await getGameDetails(String(existingData?.igdb_id));

                if (result.ok) {
                    console.log(result.data);
                    setGameData(result.data)
                    result.data.platforms && setPlatforms(result.data.platforms);
                }
            }
            run();
        }

    }, [open, mode, existingData])

    const handleFormSubmit = async(values: Z.infer<typeof formSchema>) => {
        await saveToCollection(values);
        onSaved && await onSaved?.();
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="overflow-hidden p-0 sm:max-w-4xl">
                <form id='form-extra-save-details' onSubmit={form.handleSubmit(
                    (values) => handleFormSubmit(values),
                )} className="flex max-h-[85vh] flex-col">
                    <DialogHeader className="border-b px-6 py-5">
                        <DialogTitle>Extra Details</DialogTitle>
                        <DialogDescription>
                            Add collection metadata, copy-specific details, and personal notes for this game.
                        </DialogDescription>
                    </DialogHeader>
                    <div className='no-scrollbar flex-1 overflow-y-auto px-6 py-5'>
                        <div className='flex flex-col gap-5'>
                            <Card className="gap-4 py-5">
                                <CardHeader className="px-5">
                                    <CardTitle className="text-lg">Collection Summary</CardTitle>
                                    <CardDescription>
                                        Set your personal rating and any high-level notes that apply to the whole game entry.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-5 px-5">
                                    <FieldGroup className='grid grid-cols-1 md:grid-cols-3 gap-4'>
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
                                                        <SelectTrigger>
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
                                                    <FieldDescription>
                                                        {watchedRating ? `Current rating: ${watchedRating}/5` : "Optional personal score"}
                                                    </FieldDescription>
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                </Field>
                                            )}
                                        />
                                    </FieldGroup>

                                    <Controller
                                        name="notes"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field>
                                                <FieldLabel htmlFor="notes_1">Collection Notes</FieldLabel>
                                                <Textarea
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Anything about this game overall: wishlist upgrade target, bundle notes, trade value, etc."
                                                    className="min-h-28"
                                                />
                                                <FieldDescription>
                                                    These notes apply to the game entry as a whole, not just one copy.
                                                </FieldDescription>
                                                {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                                            </Field>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card className="gap-4 py-5">
                                <CardHeader className="px-5">
                                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <CardTitle className="text-lg">Owned Copies</CardTitle>
                                            <CardDescription>
                                                Track each platform, edition, condition, and storage location separately.
                                            </CardDescription>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => appendCopies({ ...defaultCopies, platform: { ...defaultCopies.platform } })}
                                        >
                                            Add Copy
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid gap-4 px-5">
                                    {copyFields.map((copy, index) => {
                                        const watchedCopy = watchedCopies?.[index];

                                        return (
                                            <Card key={copy.id} className="gap-4 py-4">
                                                <CardHeader className="px-4">
                                                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                        <div>
                                                            <CardTitle className="text-base">Copy {index + 1}</CardTitle>
                                                            <CardDescription>
                                                                {watchedCopy?.platform?.name || "Platform not selected yet"}
                                                            </CardDescription>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            <Badge variant="secondary">{toTitleCase(watchedCopy?.media_type)}</Badge>
                                                            <Badge variant="secondary">{toTitleCase(watchedCopy?.condition)}</Badge>
                                                            <Badge variant="outline">Qty {watchedCopy?.copies ?? 0}</Badge>
                                                        </div>
                                                    </div>
                                                </CardHeader>

                                                <Separator />

                                                <CardContent className="px-4">
                                                    <FieldGroup className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                                                        <Controller
                                                            name={`copies.${index}.platform`}
                                                            control={form.control}
                                                            render={({ field, fieldState }) => (
                                                                <Field>
                                                                    <FieldLabel>Game Platform</FieldLabel>
                                                                    <Select value={`${field.value?.igdb_id}`} onValueChange={(id) => {
                                                                        const selectedPlatform = platforms.find(
                                                                            (platform) => String(platform.id) === id
                                                                        );

                                                                        if (!selectedPlatform) return;

                                                                        field.onChange({
                                                                            igdb_id: selectedPlatform.id,
                                                                            slug: selectedPlatform.slug,
                                                                            name: selectedPlatform.name
                                                                        });
                                                                    }}>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select Game Platform" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectGroup>
                                                                                <SelectLabel>Game Platform</SelectLabel>
                                                                                {platforms.map((platform) => (
                                                                                    <SelectItem key={`${platform.slug}-${platform.id}`} value={`${platform.id}`}>{platform.name}</SelectItem>
                                                                                ))}
                                                                            </SelectGroup>
                                                                        </SelectContent>
                                                                    </Select>
                                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                                </Field>
                                                            )}
                                                        />

                                                        <Controller
                                                            name={`copies.${index}.media_type`}
                                                            control={form.control}
                                                            render={({ field, fieldState }) => (
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
                                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                                </Field>
                                                            )}
                                                        />

                                                        <Controller
                                                            name={`copies.${index}.condition`}
                                                            control={form.control}
                                                            render={({ field, fieldState }) => (
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
                                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}

                                                                </Field>
                                                            )}
                                                        />

                                                        <Controller
                                                            name={`copies.${index}.purchase_date`}
                                                            control={form.control}
                                                            render={({ field, fieldState }) => (
                                                                <Field>
                                                                    <FieldLabel>Purchase Date</FieldLabel>
                                                                    <Popover>
                                                                        <PopoverTrigger asChild>
                                                                            <Button
                                                                                type="button"
                                                                                variant="outline"
                                                                                data-empty={!field.value}
                                                                                className="w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
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
                                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                                </Field>
                                                            )}
                                                        />

                                                        <Field>
                                                            <FieldLabel>Purchase Price</FieldLabel>
                                                            <div className="relative">
                                                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                                    $
                                                                </span>
                                                                <Input
                                                                    {...form.register(`copies.${index}.purchase_price`, { valueAsNumber: true })}
                                                                    type="number"
                                                                    step={0.01}
                                                                    min={0}
                                                                    placeholder="0.00"
                                                                    aria-invalid={form.formState.errors.copies?.[index]?.purchase_price ? true : false}
                                                                    className='ps-7 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                                                                />
                                                                {form.formState.errors.copies?.[index]?.purchase_price && <FieldError errors={[form.formState.errors.copies?.[index]?.purchase_price]} />}
                                                            </div>
                                                        </Field>

                                                        <Field>
                                                            <FieldLabel>UPC / Barcode</FieldLabel>
                                                            <Input
                                                                {...form.register(`copies.${index}.upc`)}
                                                                // type="number"
                                                                // inputMode="numeric"
                                                                placeholder="012345678905"
                                                                aria-invalid={form.formState.errors.copies?.[index]?.upc ? true : false}
                                                                className='[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                                                            />
                                                            <FieldDescription>
                                                                Optional retail barcode for this specific copy.
                                                            </FieldDescription>
                                                            {form.formState.errors.copies?.[index]?.upc && <FieldError errors={[form.formState.errors.copies?.[index]?.upc]} />}
                                                        </Field>

                                                        <Field>
                                                            <FieldLabel>Storage Location</FieldLabel>
                                                            <Input
                                                                {...form.register(`copies.${index}.storage_location`)}
                                                                placeholder="Room A / Shelf 2 / Bin 4"
                                                                aria-invalid={form.formState.errors.copies?.[index]?.storage_location ? true : false}
                                                            />
                                                            {form.formState.errors.copies?.[index]?.storage_location && <FieldError errors={[form.formState.errors.copies?.[index]?.storage_location]} />}

                                                        </Field>

                                                        <Field>
                                                            <FieldLabel>Copies</FieldLabel>
                                                            <Input
                                                                {...form.register(`copies.${index}.copies`, { valueAsNumber: true })}
                                                                type="number"
                                                                placeholder="1"
                                                                aria-invalid={form.formState.errors.copies?.[index]?.copies ? true : false}
                                                                className='[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                                                            />
                                                            {form.formState.errors.copies?.[index]?.copies && <FieldError errors={[form.formState.errors.copies?.[index]?.copies]} />}
                                                        </Field>

                                                        <Field className='md:col-span-3'>
                                                            <FieldLabel>Copy Notes</FieldLabel>
                                                            <Textarea
                                                                {...form.register(`copies.${index}.copy_notes`)}
                                                                placeholder="Condition details, inserts missing, where you bought it, upgrade plans, etc."
                                                                aria-invalid={form.formState.errors.copies?.[index]?.copy_notes ? true : false}
                                                                className="min-h-24"
                                                            />
                                                            {form.formState.errors.copies?.[index]?.copy_notes && <FieldError errors={[form.formState.errors.copies?.[index]?.copy_notes]} />}
                                                        </Field>
                                                    </FieldGroup>
                                                </CardContent>

                                                {(copyFields.length > 1) && (
                                                    <>
                                                        <Separator />
                                                        <div className="px-4">
                                                            <Button type="button" variant="destructive" onClick={() => removeCopies(index)}>
                                                                Remove Copy
                                                            </Button>
                                                        </div>
                                                    </>
                                                )}
                                            </Card>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <DialogFooter className="border-t px-6 py-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">Save Game</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    )
}
