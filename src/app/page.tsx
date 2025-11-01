"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { constants } from "@/lib/constants";
import Link from "next/link";
function page() {
	return (
		<div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 gap-10">
			<h1 className="text-3xl font-bold">Welcome to {constants.appName}</h1>
			<Link href="/register">
				<Button>Sign Up</Button>
			</Link>
		</div>
	);
}

export default page;
