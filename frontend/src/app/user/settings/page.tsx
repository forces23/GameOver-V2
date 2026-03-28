"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import React, { useEffect, useState } from 'react'
import * as Z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldTitle } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { getProfile, updateProfile } from '@/lib/api/db'
import { useUser } from '@auth0/nextjs-auth0'
import { ApiError, IGDBPlatform, Profile } from '@/lib/types'
import { toast, Toaster } from 'sonner';
import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxItem,
    ComboboxList,
    ComboboxValue,
    useComboboxAnchor,
} from "@/components/ui/combobox"
import PageError from '@/components/PageError'
import { s3PresignedUrl } from '@/lib/api/aws'
import { getAllPlatforms } from '@/lib/api/igdb'
import AnimatedLoading from '@/components/AnimatedLoading'
import { getAccessToken } from '@/lib/utils'

const formSchema = Z.object({
    display_name: Z
        .string()
        // .min(3, "Display name must be at least 3 characters")
        .max(20, "Display name must at most 20 characters"),
    bio: Z
        .string()
        .max(700, "Bio must be at most 700 characters"),
    email_visible: Z
        .boolean(),
    avatar: Z.object({
        file: Z.instanceof(File).nullable(),
        filename: Z.string(),
        public_url: Z.string(),
    }),
    banner: Z.object({
        file: Z.instanceof(File).nullable(),
        filename: Z.string(),
        public_url: Z.string(),
    }),
    // owned_systems: Z.array(
    //     Z.object({
    //         id: Z.number(),
    //         name: Z.string(),
    //         alias: Z.string(),
    //         icon: Z.string(),
    //         console: Z.string(),
    //         manufacturer: Z.string(),
    //     })
    // ),
    owned_systems: Z.array(
        Z.object({
            id: Z.number(),
            name: Z.string(),
            slug: Z.string(),
            abbreviation: Z.string(),
            alternative_name: Z.string(),
            platform_logo: Z.object({
                id: Z.number(),
                image_id: Z.string(),
            }),
        })
    ),
})

export default function page() {
    const { user } = useUser()
    const [defaultData, setDefaultData] = useState<Profile>();
    // const [systems, setSystems] = useState<TGDBPlatform[]>([]);
    const [systems, setSystems] = useState<IGDBPlatform[]>([]);
    const anchor = useComboboxAnchor();
    const [error, setError] = useState<ApiError | null>(null);
    const [status, setStatus] = useState<"loading" | "success" | "error" | "submitting">("loading");

    const form = useForm<Z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            display_name: "",
            bio: "",
            email_visible: false,
            avatar: {
                file: null,
                filename: "",
                public_url: "",
            },
            banner: {
                file: null,
                filename: "",
                public_url: "",
            },
            owned_systems: [],
        }
    })

    useEffect(() => {
        if (!user) return;
        let active = true;

        const run = async () => {
            setStatus("loading");

            const [accessToken, platformsResp] = await Promise.all([
                getAccessToken(),
                getAllPlatforms()
            ])
            if (!active) return;

            if (platformsResp.ok) {
                setSystems(platformsResp.data);
                setStatus("success");
            } else {
                setStatus("error")
                setError(platformsResp.error);
            }

            const profileResp = await getProfile(accessToken);
            if (!active) return;
            if (profileResp.ok) {
                const data = profileResp.data.data;
                if (!data) {
                    setStatus("success");
                    throw new Error("User data not loading");
                }

                form.reset({
                    display_name: data.display_name || "",
                    bio: data.bio || "",
                    email_visible: data.email_visible || false,
                    avatar: {
                        file: null,
                        filename: data.avatar?.filename ?? "",
                        public_url: data.avatar?.public_url ?? ""
                    },
                    banner: {
                        file: null,
                        filename: data.banner?.filename ?? "",
                        public_url: data.banner?.public_url ?? ""
                    },
                    owned_systems: data.owned_systems ?? []
                });
                setDefaultData(profileResp.data.data);
                setStatus("success");
            } else {
                setStatus("error");
                setError(profileResp.error);
            }
        }

        toast.promise(run, {
            error: "Failed to load the users profile data for settings"
        });

        return () => { active = false }
    }, [user]);

    const submitProfile = async (data: Z.infer<typeof formSchema>) => {
        // handle submission
        const accessToken = await getAccessToken();

        console.log("profile submit: ",data);

        let avatarFilename = data.avatar.filename;
        let avatarPublicUrl = data.avatar.public_url;
        let bannerFilename = data.banner.filename;
        let bannerPublicUrl = data.banner.public_url;

        // checks if new avatar file has been selected, if yes proceed to upload to s3
        if (data.avatar.file) {
            const avatarS3URI = await s3PresignedUrl(
                "images/avatar/",
                "avatar",
                data.avatar.file,
                accessToken
            );
            console.log("s3 avatar upload: ", avatarS3URI);
            if (!avatarS3URI.ok) return;
            avatarFilename = data.avatar.filename;
            avatarPublicUrl = avatarS3URI.data.url;
        }

        // checks if new banner file has been selected, if yes proceed to upload to s3
        if (data.banner.file) {
            const bannerS3URI = await s3PresignedUrl(
                "images/banner/",
                "banner",
                data.banner.file,
                accessToken
            );
            console.log("s3 avatar upload: ", bannerS3URI);
            if (!bannerS3URI.ok) return;
            bannerFilename = data.banner.file.name;
            bannerPublicUrl = bannerS3URI.data.url;
        }

        const resp = await updateProfile({
            display_name: data.display_name,
            bio: data.bio,
            email_visible: data.email_visible,
            avatar: {
                filename: avatarFilename || "",
                public_url: avatarPublicUrl || "",
            },
            banner: {
                filename: bannerFilename || "",
                public_url: bannerPublicUrl || "",
            },
            owned_systems: data.owned_systems,
        }, accessToken);

        if (resp.ok) console.log(resp);
    }

    if (status === "loading") return <AnimatedLoading />
    if (status === "error") return <PageError />

    return (
        <div className="flex grow flex-col gap-4 w-full max-w-500 px-4">
            <Toaster />
            <Tabs defaultValue="overview">
                <TabsList variant="line">
                    <TabsTrigger value="overview">Profile</TabsTrigger>
                    {/* <TabsTrigger value="analytics">Appearance</TabsTrigger> */}
                    {/* <TabsTrigger value="reports">Advanced</TabsTrigger> */}
                </TabsList>
            </Tabs>

            <Card>
                <CardContent>
                    <form id="form-profile-info" onSubmit={form.handleSubmit(async (data) => {
                        setStatus("submitting");
                        toast.promise(submitProfile(data), {
                            loading: "Submitting your profile settings...",
                            success: "Profile data saved successfully!",
                            error: "Oops something went wrong. Try again.."
                        })
                        setStatus("success");
                    })}>
                        <FieldGroup>
                            <FieldGroup className="flex flex-row flex-wrap sm:flex-nowrap">
                                <Controller
                                    name="display_name"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel htmlFor="profile-display-name">
                                                Display Name
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id="profile-display-name"
                                                // onChange={field.onChange}
                                                aria-invalid={fieldState.invalid}
                                                maxLength={20}
                                                placeholder="Rick Prime 34-C"
                                                autoComplete="off"
                                            />
                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />
                                <Controller
                                    name="email_visible"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel htmlFor="profile-email-visible">
                                                <Field orientation="horizontal">
                                                    <FieldContent>
                                                        <FieldTitle>Email visible</FieldTitle>
                                                        <FieldDescription>
                                                            Enabling this will make your email be visible to the public.
                                                        </FieldDescription>
                                                    </FieldContent>
                                                    <Switch
                                                        id="profile-email-visible"
                                                        checked={!!field.value}
                                                        onCheckedChange={field.onChange}
                                                        aria-invalid={fieldState.invalid}
                                                        onBlur={field.onBlur}
                                                    />
                                                    {fieldState.invalid && (
                                                        <FieldError errors={[fieldState.error]} />
                                                    )}
                                                </Field>
                                            </FieldLabel>
                                        </Field>
                                    )}
                                />
                            </FieldGroup>
                            <FieldGroup>
                                <Controller
                                    name={"owned_systems"}
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel>Owned Systems</FieldLabel>
                                            <Combobox
                                                multiple
                                                autoHighlight
                                                items={systems}
                                                value={field.value ?? []}
                                                onValueChange={(values) => field.onChange(Array.isArray(values) ? values : [])}
                                                isItemEqualToValue={(a, b) => a.id === b.id}
                                            >
                                                <ComboboxChips ref={anchor} className="w-full ">
                                                    <ComboboxValue>
                                                        {(values) => (
                                                            <React.Fragment>
                                                                {/* {values.map((item: TGDBPlatform, i: number) => ( */}
                                                                {values.map((item: IGDBPlatform, i: number) => (
                                                                    <ComboboxChip key={`${item.id}-${i}`}>{item.name}</ComboboxChip>
                                                                ))}
                                                                <ComboboxChipsInput placeholder="Select platforms..." />
                                                            </React.Fragment>
                                                        )}
                                                    </ComboboxValue>
                                                </ComboboxChips>

                                                <ComboboxContent anchor={anchor}>
                                                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                                                    <ComboboxList>
                                                        {/* {(item: TGDBPlatform, i: number) => ( */}
                                                        {(item: IGDBPlatform, i: number) => (
                                                            <ComboboxItem key={`${item.id}-${i + 1}`} value={item}>
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
                            </FieldGroup>

                            <Controller
                                name="bio"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel htmlFor="profile-bio">
                                            Bio
                                        </FieldLabel>
                                        <Textarea
                                            {...field}
                                            aria-invalid={fieldState.invalid}
                                            id="profile-bio"
                                            maxLength={700}
                                            placeholder='Tell a little something about yourself...'
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="avatar"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel htmlFor="profile-avatar-url">
                                            Profile picture
                                        </FieldLabel>
                                        <Input
                                            aria-invalid={fieldState.invalid}
                                            id="profile-avatar-url"
                                            type='file'
                                            accept='image/*'
                                            onBlur={field.onBlur}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0] ?? null
                                                field.onChange({
                                                    ...field.value,
                                                    filename: file?.name ?? "",
                                                    file,

                                                })
                                            }}
                                        />
                                        <FieldDescription>
                                            {field.value.filename || "No file selected"}
                                        </FieldDescription>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="banner"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel htmlFor="profile-banner-url">
                                            Profile Banner
                                        </FieldLabel>
                                        <Input
                                            aria-invalid={fieldState.invalid}
                                            id="profile-banner-url"
                                            type='file'
                                            accept='image/*'
                                            onBlur={field.onBlur}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0] ?? null
                                                field.onChange({
                                                    ...field.value,
                                                    filename: file?.name ?? "",
                                                    file,

                                                })
                                            }}
                                        />
                                        <FieldDescription>
                                            {field.value.filename || "No file selected"}
                                        </FieldDescription>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                            <Field orientation="horizontal" className="justify-end" >
                                <Button type="submit" form="form-profile-info" disabled={status === "submitting"}>
                                    {status === "submitting" ? "Saving..." : "Submit"}
                                </Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
