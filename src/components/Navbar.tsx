"use client";

import { signOut } from "next-auth/react";
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
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import LogoProvider from "./LogoProvider";
export default function Navbar() {
	const { user, isLoadingUser } = useUserStore();
	const { theme, setTheme } = useTheme();

	return isLoadingUser ? (
		<NavbarSkeleton />
	) : (
		<nav className="w-full bg-secondary-foreground dark:bg-card fixed top-0  z-100 text-background dark:text-foreground px-6 py-3 flex items-center justify-between">
                <Link href="/" className="text-xl font-semibold flex items-center gap-2">
                <LogoProvider className="size-10" />
				{constants.appName}
			</Link>

			<div className="flex items-center gap-2">
				<button
					aria-label="Toggle theme"
					onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
					className="rounded-full border border-neutral-600 p-2 hover:bg-neutral-700 "
				>
					{theme === "dark" ? (
						<Sun className="h-5 w-5 text-yellow-400 transition-all" />
					) : (
						<Moon className="h-5 w-5 text-slate-500 transition-all" />
					)}
				</button>
				{user ? (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="secondary" className="rounded-full p-0 w-10 h-10 ">
								<Avatar className="w-10 h-10  ">
									<AvatarImage
										src={user.avatar ?? ""}
										alt={user.name ?? "User"}
									/>
									<AvatarFallback className="bg-white hover:bg-neutral-700 text-black hover:text-white">
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

							<DropdownMenuItem asChild disabled={user._id === "guest"}>
								<Link href="/dashboard" className="flex items-center">
									<User className="w-4 h-4 mr-2" /> Dashboard
								</Link>
							</DropdownMenuItem>

							{/* <DropdownMenuSeparator /> */}

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
			</div>
		</nav>
	);
}
