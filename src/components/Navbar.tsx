"use client";

import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { constants } from "@/lib/constants";
import NavbarSkeleton from "./skeletons/Navbar.Skeleton";
import { useUserStore } from "@/store/user.store";


export default function Navbar() {
    const {user , isLoadingUser} = useUserStore();

	return isLoadingUser ? (
		<NavbarSkeleton />
	) : (
		<nav className="w-full border-b bg-secondary-foreground fixed top-0  z-100 text-background px-6 py-3 shadow-sm flex items-center justify-between">
			<Link href="/" className="text-xl font-semibold">
				{constants.appName}
			</Link>

			{user ? (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="rounded-full p-0 w-10 h-10">
							<Avatar className="w-10 h-10  ">
								<AvatarImage
									src={user.avatar ?? ""}
									alt={user.name ?? "User"}
								/>
								<AvatarFallback className="bg-background/20 text-background hover:text-foreground">
									{user.name?.[0]?.toUpperCase() ?? "U"}
								</AvatarFallback>
							</Avatar>
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent align="end" className="w-48 z-110">
						<DropdownMenuLabel>
							<p className="text-sm font-medium">{user.name}</p>
							<p className="text-xs text-muted-foreground truncate">
								@{user.username}
							</p>
						</DropdownMenuLabel>

						<DropdownMenuSeparator />

						<DropdownMenuItem asChild>
							<Link href="/profile" className="flex items-center">
								<User className="w-4 h-4 mr-2" /> View Profile
							</Link>
						</DropdownMenuItem>

						<DropdownMenuItem asChild>
							<Link href="/settings" className="flex items-center">
								<Settings className="w-4 h-4 mr-2" /> Settings
							</Link>
						</DropdownMenuItem>

						<DropdownMenuSeparator />

						<DropdownMenuItem
							onClick={() => signOut({ callbackUrl: "/login" })}
							className="text-red-600 focus:text-red-600 cursor-pointer"
						>
							<LogOut className="w-4 h-4 mr-2" /> Logout
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			) : (
				<Link href="/login">
					<Button variant="default">Login</Button>
				</Link>
			)}
		</nav>
	);
}
