"use client";
import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import HomeSkeleton from "@/components/skeletons/Home.Skeleton";

function page() {
	const session = useSession();
	const router = useRouter();
	if (session.status === "authenticated") router.push("/dashboard");
	else if (session.status === "unauthenticated") router.push("/login");

    return (
        <HomeSkeleton />
	);
}

export default page;
