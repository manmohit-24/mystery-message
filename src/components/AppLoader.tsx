"use client";

import React from "react";
import { Spinner } from "./ui/spinner";
import { useSession } from "next-auth/react";

export default function ({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = useSession();

	return session.status === "loading" ? (
		<body className="flex items-center justify-center h-screen">
			<Spinner className="text-primary size-15"  />
		</body>
	) : (
		children
	);
}
