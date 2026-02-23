"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import React, { useEffect, useMemo, useState } from 'react'
import * as Z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, UseFormReturn } from "react-hook-form"
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldTitle } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { getProfile, updateProfile } from '@/lib/api/db'
import { useUser } from '@auth0/nextjs-auth0'
import { Profile, TGDBPlatform } from '@/lib/types'
import { getPlatforms } from '@/lib/api/tgdb'
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
    avatar_url: Z
        .string(),
    banner_url: Z
        .string(),
    owned_systems: Z.array(
        Z.object({
            id: Z.number(),
            name: Z.string(),
            alias: Z.string(),
            icon: Z.string(),
            console: Z.string(),
            manufacturer: Z.string(),
        })
    ),
})

export default function page() {
    const { user, isLoading } = useUser()
    const [defaultData, setDefaultData] = useState<Profile>();
    const [systems, setSystems] = useState<TGDBPlatform[]>([]);
    const anchor = useComboboxAnchor();
    const form = useForm<Z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            display_name: "",
            bio: "",
            email_visible: false,
            avatar_url: "",
            banner_url: "",
            owned_systems: [],
        }
    })

    useEffect(() => {
        if (isLoading || !user) return;

        const run = async () => {
            const tokenResponse = await fetch("/api/auth/token");
            const { accessToken } = await tokenResponse.json();
            const profileResp = await getProfile(accessToken);
            const platformsResp = await getPlatforms();

            if (profileResp.ok) {
                const data = profileResp.data.data
                form.reset({
                    display_name: data.display_name,
                    bio: data.bio,
                    email_visible: data.email_visible,
                    avatar_url: data.avatar_url,
                    banner_url: data.banner_url,
                    owned_systems: data.owned_systems ?? []
                });
                setDefaultData(profileResp.data.data);

                if (platformsResp.ok) {
                    console.log(platformsResp)
                    setSystems(platformsResp.data);
                }
            }
        }
        run()
    }, [user, isLoading])

    const submitProfile = async (data: Z.infer<typeof formSchema>) => {
        // handle submission
        console.log(data);
        const tokenResponse = await fetch("/api/auth/token");
        const { accessToken } = await tokenResponse.json();

        const resp = await updateProfile(data, accessToken)

        if (resp.ok) console.log(resp);
    }

    return (
        <div className="flex grow flex-col gap-4 w-full max-w-500 px-4">
            <Tabs defaultValue="overview">
                <TabsList variant="line">
                    <TabsTrigger value="overview">Profile</TabsTrigger>
                    <TabsTrigger value="analytics">Appearance</TabsTrigger>
                    <TabsTrigger value="reports">Advanced</TabsTrigger>
                </TabsList>
            </Tabs>

            <Card>
                <CardContent>
                    <form id="form-profile-info" onSubmit={form.handleSubmit(submitProfile)}>
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
                                                // itemToStringLabel={(item) => item.name}
                                                // itemToStringValue={(item) => item.alias}
                                            >
                                                <ComboboxChips ref={anchor} className="w-full ">
                                                    <ComboboxValue>
                                                        {(values) => (
                                                            <React.Fragment>
                                                                {values.map((item: TGDBPlatform, i:number) => (
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
                                                        {(item: TGDBPlatform, i:number) => (
                                                            <ComboboxItem key={`${item.id}-${i+1}`} value={item}>
                                                                {item.name}
                                                            </ComboboxItem>
                                                        )}
                                                    </ComboboxList>
                                                </ComboboxContent>
                                            </Combobox>
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
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
                                name="avatar_url"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel htmlFor="profile-avatar-url">
                                            Profile picture
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            aria-invalid={fieldState.invalid}
                                            id="profile-avatar-url"
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="banner_url"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel htmlFor="profile-banner-url">
                                            Profile Banner
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            aria-invalid={fieldState.invalid}
                                            id="profile-banner-url"
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                            <Field orientation="horizontal" className="justify-end" >
                                <Button type="submit" form="form-profile-info">
                                    Submit
                                </Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>


    )
}
