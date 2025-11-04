"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { constants } from "@/lib/constants";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Spinner } from "@/components/ui/spinner";
import { signOut } from "next-auth/react";

function page() {
	const session = useSession();

	return (
		<div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 gap-10">
			<h1 className="text-3xl font-bold">Welcome to {constants.appName}</h1>
			<div className="flex gap-5 p-5 shadow-sm bg-white/50 rounded-sm">
				{session.status === "loading" && <Spinner />}
				{session.status === "unauthenticated" && (
					<>
						<Link href="/register">
							<Button>Register</Button>
						</Link>
						<Link href="/login">
							<Button variant={"outline"}>Login</Button>
						</Link>
					</>
				)}

				{session.status === "authenticated" && (
					<>
						<Button
							variant="destructive"
							onClick={() => signOut({ callbackUrl: "/login" })}
						>
							Log Out
						</Button>
						<Link href="/dashboard">
							<Button>Dashboard</Button>
						</Link>
					</>
				)}
			</div>
		</div>
	);
}

export default page;
