"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import axios, { AxiosError } from "axios";
import { ApiResType } from "@/lib/APIResponse";
import { toast } from "sonner";
import { useUserStore } from "@/store/user.store";
import { signIn } from "next-auth/react";
import { useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthWatcher() {
	const router = useRouter();
	const pathname = usePathname();
	const { status } = useSession();
	const { setIsLoadingUser } = useUserStore();
	const loaderset = useRef(false);
	const unAuthLoaderSet = useRef(false);

	if (status === "loading") {
		if (!loaderset.current) {
			setIsLoadingUser(true);
			loaderset.current = true;
		}
		return null;
	}

	if (status === "unauthenticated") {
		if (pathname.startsWith("/u")) return <GuestLogin />;
		else if (!unAuthLoaderSet.current) {
			setIsLoadingUser(false);
			unAuthLoaderSet.current = true;
		}
	}

	if (status === "authenticated") return <UserFetcher />;

	return null;
}

export function GuestLogin() {
	const { setIsLoadingUser } = useUserStore();

	useEffect(() => {
		(async () => {
			setIsLoadingUser(true);
			try {
				const res = await signIn("guest", { redirect: false });
				if (res?.error) toast.error(res.error.replace("Error: ", ""));
				toast.success("Logged in as guest");
			} catch (error: any) {
				toast.error(error.message || "Guest login failed");
			} finally {
				setIsLoadingUser(false);
			}
		})();
	}, []);

	return null;
}

export function UserFetcher() {
	const { setUser, setIsLoadingUser } = useUserStore();

	useEffect(() => {
		(async () => {
			setIsLoadingUser(true);
			try {
				const { data: res } = await axios.get(`/api/get-user?username=me`);
				if (res.success) setUser(res.data.user);
			} catch (error) {
				const axiosError = error as AxiosError<ApiResType>;
				toast.error(
					axiosError.response?.data.message || "Something went wrong"
				);
			} finally {
				setIsLoadingUser(false);
			}
		})();
	}, []);

	return null;
}
