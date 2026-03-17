import React from 'react'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { ChevronDownIcon } from 'lucide-react';
import { FaRegStar, FaStar } from 'react-icons/fa';
import { FieldGroup, Field, FieldLabel, FieldError } from '../ui/field';
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
import { getTodaysDate } from '@/lib/utils';
import { saveGame } from '@/lib/api/db';
import { toast } from 'sonner';
import { GameData, Mark } from '@/lib/types';
import { useUser } from '@auth0/nextjs-auth0';


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

type CollectedGamesDetailsProps = {
    extraDetailOpen: boolean
    setExtraDetailsOpen: React.Dispatch<React.SetStateAction<boolean>>
    mark: Mark
    setMark: React.Dispatch<React.SetStateAction<Mark>>
    gameDetails: GameData
    prevMark: Mark

}

export default function CollectedGamesDetails({
    extraDetailOpen,
    setExtraDetailsOpen,
    mark,
    setMark,
    gameDetails,
    prevMark
}: CollectedGamesDetailsProps) {
    const { user } = useUser();

    const currentPath = `${window.location.pathname}${window.location.search}`;
    console.log(currentPath)

    const form = useForm<Z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultGameSave
    });

    const { fields: copyFields, append: appendCopies, remove: removeCopies } = useFieldArray({
        control: form.control,
        name: "copies"
    })

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
    return (
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
                                    setMark(mark)
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
    )
}
