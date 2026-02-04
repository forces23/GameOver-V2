'use client'

import SearchBar from './SearchBar'
import { useRouter } from 'next/navigation'
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


export default function Header() {
    const router = useRouter();
    const { user, isLoading } = useUser();

    return (
        <header className="w-full flex pt-2 h-20">
            <div className="flex w-full h-full items-center ps-2">
                <span
                    className={`cursor-pointer font-press-start-2p text-4xl`}
                    onClick={() => { router.push("/") }}
                >
                    {/* <Logo1 /> */}
                    GameOver
                </span>
            </div>
            <div className="flex items-center gap-4 px-4 w-200 h-full">
                <div className="w-full">
                    <SearchBar />
                </div>
                {user ?
                    <div>
                        {/* <CircleUserRound /> */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full cursor-pointer">
                                    <Avatar>
                                        <AvatarImage src="https://github.com/shadcn.png" alt="user-avatar" />
                                        <AvatarFallback>BL</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-32">
                                <DropdownMenuGroup>
                                    <DropdownMenuItem onClick={() => {router.push("/profile")}}>Profile</DropdownMenuItem>
                                    <DropdownMenuItem>Want</DropdownMenuItem>
                                    <DropdownMenuItem>Collection</DropdownMenuItem>
                                    <DropdownMenuItem>Settings</DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem variant="destructive">
                                        <a
                                            href="/auth/logout"
                                            className="button logout"
                                        >
                                            Log Out
                                        </a>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    :
                    <div>
                        <a
                            href="/auth/login"
                            className="button login "
                        >
                            <Button className="cursor-pointer">
                                Log in
                            </Button>
                        </a>
                    </div>
                }
            </div>
        </header>
    )
}
