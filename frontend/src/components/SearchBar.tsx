"use client"

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { getAllPlatforms, getGameSearch, getIGDBGenres, getIGDBThemes } from "@/lib/api/igdb";
import { formatUnixTimeToDateTime, toUnixString } from "@/lib/utils";
import { Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList, ComboboxValue, useComboboxAnchor } from "./ui/combobox";
import * as Z from "zod"
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";

type IGDBGenres = {
    id: number,
    name: string,
    slug: string
}
type IGDBThemes = {
    id: number,
    name: string,
    slug: string
}

type IGDBConsole = {
    id: string,
    abbreviation: string,
    alternative_name: string,
    checksum: string,
    name: string,
    slug: string
    platform_logo: {
        id: string,
        alpha_channel: string,
        animated: string,
        checksum: string,
        image_id: string,
        name: string
    },
    versions: {
        id: string,
        slug: string,
        platform_version_release_dates: {
            id: string,
            date: string,
        }
    },
}

type GameSearchPayload = {
    query: string;
    genres: number[];
    themes: number[];
    consoles: number[];
    fromDate: string;
    toDate: string;
    page: number;
    limit: number;
    sort: string;
};


const formSchema = Z.object({
    query: Z.string(),
    genres: Z.array(
        Z.object({
            id: Z.number(),
            name: Z.string(),
            slug: Z.string()
        })
    ),
    themes: Z.array(
        Z.object({
            id: Z.number(),
            name: Z.string(),
            slug: Z.string()
        })),
    consoles: Z.array(
        Z.object({
            id: Z.number(),
            name: Z.string(),
            slug: Z.string()
        })),
    fromDate: Z.string().nullable(),
    toDate: Z.string().nullable()
})
    .superRefine((data, ctx) => {
        if (!data.fromDate || !data.toDate) return;

        const from = Number(data.fromDate);
        const to = Number(data.toDate);

        if (Number.isNaN(from) || Number.isNaN(to)) return;

        if (from >= to) {
            ctx.addIssue({
                code: "custom",
                path: ["fromDate"],
                message: "From date must be before the To date."
            });
            ctx.addIssue({
                code: "custom",
                path: ["toDate"],
                message: "To date must be after From date."
            });
        }
    });

type SearchBarProps = {
    originalData: any[];
    setData: React.Dispatch<React.SetStateAction<any[]>>
    searchType: "console" | "game",
    onSubmitFilters?: (payload: GameSearchPayload) => void,
    filters?: {
        query: string,
        genres?: number[],
        themes?: number[],
        consoles?: number[],
        fromDate?: string,
        toDate?: string
    }
}



export default function SearchBar({ originalData, setData, filters, searchType = "game", onSubmitFilters }: SearchBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchRef = useRef<HTMLDivElement>(null);
    const [themes, setThemes] = useState<IGDBThemes[]>([]);
    const [genres, setGenres] = useState<IGDBGenres[]>([]);
    const [consoles, setConsoles] = useState<IGDBConsole[]>([]);
    const genresAnchor = useComboboxAnchor();
    const themesAnchor = useComboboxAnchor();
    const consoleAnchor = useComboboxAnchor();
    const form = useForm<Z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            query: "",
            genres: [],
            themes: [],
            consoles: [],
            fromDate: "",
            toDate: ""
        }
    })
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

    useEffect(() => {
        let active = true;

        const run = async () => {
            setStatus("loading");

            const genresResult = await getIGDBGenres();
            const themesResult = await getIGDBThemes();
            const consolesResult = await getAllPlatforms();
            if(!active) return;

            if (themesResult.ok) {
                setStatus("loading");
                setThemes(themesResult.data);
            } else {
                setStatus("error");
            }

            if (genresResult.ok) {
                setStatus("loading");
                setGenres(genresResult.data);
            } else {
                setStatus("error");
            }

            if (consolesResult.ok) {
                setStatus("loading");
                setConsoles(consolesResult.data);
            } else {
                setStatus("error");
            }
        }

        if (searchType === "game") run();
        return () => {() => {active = true}}
    }, []);

    useEffect(() => {
        if (searchType !== "game") return;
        if (!filters) return;
        if (!genres.length || !themes.length || !consoles.length) return;

        form.reset({
            query: filters.query ?? "",
            genres: genres.filter(g => (filters.genres ?? []).includes(g.id)),
            themes: themes.filter(t => (filters.themes ?? []).includes(t.id)),
            consoles: consoles
                .filter(c => (filters.consoles ?? []).includes(Number(c.id)))
                .map((c => ({ id: Number(c.id), name: c.name, slug: c.slug }))),
            fromDate: filters.fromDate ?? "",
            toDate: filters.toDate ?? ""
        })
    }, [filters, genres, themes, consoles, form, searchType])



    const searchData = async (values: Z.infer<typeof formSchema>) => {
        //normalize data to be pushed to api
        const payload = {
            "query": values.query ?? "",
            "genres": values.genres.map((g) => g.id),
            "themes": values.themes.map((t) => t.id),
            "consoles": values.consoles.map((c) => c.id),
            "fromDate": values.fromDate ?? "",
            "toDate": values.toDate ?? "",
            "page": 1,
            "limit": 50,
            "sort": "asc"
        }

        console.log(payload);
        if (searchType === "game") {
            const result = await getGameSearch(payload);
            if (result.ok) {
                router.replace(pathname, { scroll: false })
                setData(result.data)
            }
            onSubmitFilters?.(payload);
            return;
        }
        if (searchType === "console") {
            const q = values.query.trim().toLowerCase();

            const results = originalData.filter((item) =>
                item.name.toLowerCase().includes(q) || item.alias?.toLowerCase().includes(q)
            );

            setData(results);
        }
    }

    return (
        <>
            <div className="relative w-full " ref={searchRef}>
                <form id="form-search-games" onSubmit={form.handleSubmit(searchData)}>
                    <FieldGroup className="pb-3">
                        <Controller
                            name="query"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field orientation="horizontal" >
                                    <Input
                                        {...field}
                                        aria-invalid={fieldState.invalid}
                                        type="search"
                                        placeholder="Search..."
                                        autoComplete="on"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}

                                </Field>
                            )}
                        />
                    </FieldGroup>
                    {searchType === "game" &&
                        <FieldGroup className="flex md:flex-row gap-2 pb-4">
                            <Controller
                                name="genres"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field className="gap-1">
                                        <FieldLabel>
                                            Genres
                                        </FieldLabel>
                                        <Combobox
                                            multiple
                                            autoHighlight
                                            items={genres}
                                            value={field.value ?? []}
                                            onValueChange={(values) => field.onChange(Array.isArray(values) ? values : [])}
                                            isItemEqualToValue={(a, b) => a.id === b.id}
                                            defaultValue={[]}
                                        >
                                            <ComboboxChips ref={genresAnchor} className="w-full md:max-w-xs">
                                                <ComboboxValue>
                                                    {(values: IGDBGenres[]) => (
                                                        <React.Fragment>
                                                            {values.map((value: IGDBGenres) => (
                                                                <ComboboxChip key={value.slug}>{value.name}</ComboboxChip>
                                                            ))}
                                                            <ComboboxChipsInput />
                                                        </React.Fragment>
                                                    )}
                                                </ComboboxValue>
                                            </ComboboxChips>
                                            <ComboboxContent anchor={genresAnchor}>
                                                <ComboboxEmpty>No items found.</ComboboxEmpty>
                                                <ComboboxList>
                                                    {(item) => (
                                                        <ComboboxItem key={item.slug} value={item}>
                                                            {item.name}
                                                        </ComboboxItem>
                                                    )}
                                                </ComboboxList>
                                            </ComboboxContent>
                                        </Combobox>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="themes"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field className="gap-1">
                                        <FieldLabel>
                                            Themes
                                        </FieldLabel>
                                        <Combobox
                                            multiple
                                            autoHighlight
                                            items={themes}
                                            value={field.value ?? []}
                                            onValueChange={(values) => field.onChange(Array.isArray(values) ? values : [])}
                                            isItemEqualToValue={(a, b) => a === b}
                                            defaultValue={[]}
                                        >
                                            <ComboboxChips ref={themesAnchor} className="w-full md:max-w-xs">
                                                <ComboboxValue>
                                                    {(values: IGDBThemes[]) => (
                                                        <React.Fragment>
                                                            {values.map((value: IGDBThemes) => (
                                                                <ComboboxChip key={value.slug}>{value.name}</ComboboxChip>
                                                            ))}
                                                            <ComboboxChipsInput />
                                                        </React.Fragment>
                                                    )}
                                                </ComboboxValue>
                                            </ComboboxChips>
                                            <ComboboxContent anchor={themesAnchor}>
                                                <ComboboxEmpty>No items found.</ComboboxEmpty>
                                                <ComboboxList>
                                                    {(item) => (
                                                        <ComboboxItem key={item.slug} value={item}>
                                                            {item.name}
                                                        </ComboboxItem>
                                                    )}
                                                </ComboboxList>
                                            </ComboboxContent>
                                        </Combobox>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="consoles"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field className="gap-1">
                                        <FieldLabel>
                                            Consoles
                                        </FieldLabel>
                                        <Combobox
                                            multiple
                                            autoHighlight
                                            items={consoles}
                                            value={field.value ?? []}
                                            onValueChange={(values) => field.onChange(Array.isArray(values) ? values : [])}
                                            isItemEqualToValue={(a, b) => a === b}
                                            defaultValue={[]}
                                        >
                                            <ComboboxChips ref={consoleAnchor} className="w-full md:max-w-xs">
                                                <ComboboxValue>
                                                    {(values: IGDBThemes[]) => (
                                                        <React.Fragment>
                                                            {values.map((value: IGDBThemes) => (
                                                                <ComboboxChip key={value.slug}>{value.name}</ComboboxChip>
                                                            ))}
                                                            <ComboboxChipsInput />
                                                        </React.Fragment>
                                                    )}
                                                </ComboboxValue>
                                            </ComboboxChips>
                                            <ComboboxContent anchor={consoleAnchor}>
                                                <ComboboxEmpty>No items found.</ComboboxEmpty>
                                                <ComboboxList>
                                                    {(item) => (
                                                        <ComboboxItem key={item.slug} value={item}>
                                                            {item.name}
                                                        </ComboboxItem>
                                                    )}
                                                </ComboboxList>
                                            </ComboboxContent>
                                        </Combobox>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                            <FieldGroup className="flex flex-row">
                                <Controller
                                    name="fromDate"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field className=" w-44 gap-1">
                                            <FieldLabel htmlFor="date">From</FieldLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="justify-start font-normal"
                                                    >
                                                        {field.value ? formatUnixTimeToDateTime(field.value).date : "Select date"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        captionLayout="dropdown"
                                                        selected={field.value ? new Date(Number(field.value) * 1000) : undefined}
                                                        onSelect={(date) => { field.onChange(date ? toUnixString(date) : "") }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />
                                <Controller
                                    name="toDate"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field className="w-44 gap-1">
                                            <FieldLabel htmlFor="date">To</FieldLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="justify-start font-normal"
                                                    >
                                                        {field.value ? formatUnixTimeToDateTime(field.value).date : "Select date"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        captionLayout="dropdown"
                                                        selected={field.value ? new Date(Number(field.value) * 1000) : undefined}
                                                        onSelect={(date) => { field.onChange(date ? toUnixString(date) : "") }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />
                            </FieldGroup>
                        </FieldGroup>
                    }
                    <FieldGroup className="gap-2 flex flex-row justify-end">
                        <Button
                            type="submit"
                            form="form-search-games"
                            className="bg-purple-500 text-white hover:bg-purple-700"
                        >
                            Search
                        </Button>
                        <Button
                            type="reset"
                            onClick={() => setData(originalData)}
                            className="bg-red-500 text-white hover:bg-red-700"
                        >
                            Reset
                        </Button>
                    </FieldGroup>
                </form>
            </div >
        </>
    );
}
