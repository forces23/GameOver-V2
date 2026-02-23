'use client'

import SearchBar from './SearchBar'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUser } from '@auth0/nextjs-auth0'
import { isPublicRoute } from '@/lib/utils'
import { RiMenu5Line, RiMenu4Fill } from "react-icons/ri";
import { TbSearch } from "react-icons/tb";
import { useState } from 'react'
import SearchBox from './search/SearchBox'


export default function Header() {
    const router = useRouter();
    const { user, isLoading } = useUser();
    const pathName = usePathname();
    const searchParams = useSearchParams();
    const [searchActive, setSearchActive] = useState<boolean>(false);

    const handleAuthSession = (authType: string) => {
        // get the current path so you can return to it after logging out 
        const urlParams = searchParams.toString();
        const currentPath = `${pathName}${urlParams ? `?${urlParams}` : ''}`;
        console.log(currentPath)

        // checks to see if current path is a public path
        const safe = isPublicRoute(currentPath) ? currentPath : "/";
        sessionStorage.setItem("postLogoutPath", safe)

        // window.location.href = `/auth/logout`
        window.location.href = `/auth/${authType}?returnTo=${encodeURI(`${window.location.origin}/session-return`)}`;
    }

    return (
        <header className="w-full flex pt-2 h-20">
            <div className="flex w-full h-full items-center ps-2">
                <span
                    className={`cursor-pointer font-press-start-2p text-4xl`}
                    onClick={() => { router.push("/") }}
                >
                    GameOver
                </span>
            </div>
            <div className="flex items-center gap-4 px-4 justify-end ">
                <div className="hidden md:flex">
                    <SearchBox />
                </div>
                <div className="md:hidden" onClick={() => setSearchActive(prev => !prev)}>
                    <TbSearch />
                </div>
                <div className={`${!user && 'md:hidden' }`}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className={`rounded-full cursor-pointer ${!user && 'md:hidden'}`}>
                                {user ? (
                                    <Avatar>
                                        <AvatarImage src="https://github.com/shadcn.png" alt="user-avatar" />
                                        <AvatarFallback>BL</AvatarFallback>
                                    </Avatar>
                                ) : <RiMenu5Line className='md:hidden' />}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-32">
                            <DropdownMenuGroup>
                                <DropdownMenuItem onClick={() => { router.push("") }}>Consoles</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push("")}>Upcoming Releases</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push("")}>Events</DropdownMenuItem>
                                {user && (
                                    <>
                                        <DropdownMenuItem onClick={() => { router.push("/user/profile") }}>Profile</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => router.push("/user/wishlist")}>wishlist</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => router.push("/user/collection")}>Collection</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => router.push("/user/settings")}>Settings</DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                {user ? (
                                    <DropdownMenuItem variant="destructive">
                                        <button
                                            onClick={() => handleAuthSession("logout")}
                                            className="button logout"
                                        >
                                            Log Out
                                        </button>
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem variant="default">
                                        <button
                                            onClick={() => handleAuthSession("login")}
                                            className="button logout"
                                        >
                                            Log In
                                        </button>
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                {!user && (
                    <div className='hidden md:flex'>
                        <Button
                            onClick={() => handleAuthSession("login")}
                            className="login cursor-pointer">
                            Log in
                        </Button>
                    </div>
                )}
            </div>
        </header>
    )
}
