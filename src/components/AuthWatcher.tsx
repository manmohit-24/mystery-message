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

const authPaths = [
	"login",
	"register",
	"forgot-password",
	"reset-password",
	"activate",
];

const appPaths = ["dashboard", "send"];

export default function AuthWatcher() {
	const router = useRouter();
	const pathname = usePathname().split("/")[1];
	const { status } = useSession();
	const { setIsLoadingUser } = useUserStore();
	const loaderset = useRef(false);

	switch (status) {
		case "loading":
			if (!loaderset.current) {
				setIsLoadingUser(true);
				loaderset.current = true;
			}
			return null;
		case "unauthenticated":
			if (pathname === "send") return <GuestLogin />;
			else return <UnAuthRouting pathname={pathname} router={router} />;
		case "authenticated":
			return <UserFetcher pathname={pathname} router={router} />;
		default:
			return null;
	}
}

export function UnAuthRouting({
	pathname,
	router,
}: {
	pathname: string;
	router: any;
}) {
	const { setIsLoadingUser } = useUserStore();

	useEffect(() => {
		setIsLoadingUser(true);
		console.log(pathname);

		if (!authPaths.includes(pathname)) {
			if (pathname !== "") toast.warning("You are not logged in");
			router.push("/login");
		}
		setIsLoadingUser(false);
	}, [pathname]);

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

export function UserFetcher({
	pathname,
	router,
}: {
	pathname: string;
	router: any;
}) {
	const { user, setUser, setIsLoadingUser } = useUserStore();
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
				/*setIsLoadingUser(false)
                isLoadingUser is not set to be false here because setUser will take time to update the store. 
                Ironically, we observed that even though the setUser is called before calling setIsLoadingUser to false,
                the isLoadingUser updates before the user. This causes the user to be null for a little time even after isLoadingUser is set to false.
                */
			}
		})();
	}, []);

	useEffect(() => {
		setIsLoadingUser(true);
		console.log(pathname);

		if (user) {
			if (user._id !== "guest") {
				if (authPaths.includes(pathname)) {
					toast.warning("You are already logged in");
					router.push("/dashboard");
				} else if (!appPaths.includes(pathname)) router.push("/dashboard");
			} else if (pathname === "dashboard") {
				toast.warning("Please login to access dashboard");
				router.push("/login");
			}
			/*
            So we are setting isLoadingUser to false here, 
            as it is under is if(user) block, 
            it is confirmed that user has been set in store
            */
			setIsLoadingUser(false);
		}
	}, [pathname, user]);

	return null;
}
