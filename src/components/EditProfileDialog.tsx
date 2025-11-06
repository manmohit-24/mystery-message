"use client";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SquarePen } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";
import { useForm, Controller } from "react-hook-form";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { editProfileSchema } from "@/schemas/auth.schema";
import axios, { AxiosError } from "axios";
import { ApiResType } from "@/lib/APIResponse";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { useDebounceValue } from "usehooks-ts";
import { Spinner } from "./ui/spinner";
import z from "zod";
import { useUserStore } from "@/store/user.store";

export default function EditProfileDialog() {
	const user = useUserStore((state) => state.user);
	const [username, setUsername] = useState("");
	const [usernameMsg, setUsernameMsg] = useState("");
	const [isUsernameAvailable, setIsUsernameAvailable] = useState(false);
	const [debouncedUsername, setDebouncedUsername] = useDebounceValue(
		username,
		500
	);
	const [isCheckingUsername, setIsCheckingUsername] = useState(false);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const form = useForm({
		resolver: zodResolver(editProfileSchema),
		defaultValues: {
			name: user?.name || "",
			username: user?.username || "",
		},
	});

	useEffect(() => {
		(async () => {
			if (debouncedUsername) {
				setIsCheckingUsername(true);
				setUsernameMsg("");

				try {
					const { data: res } = await axios.get(
						`/api/check-username-uniqueness?username=${debouncedUsername}`
					);
					setIsUsernameAvailable(res.success);
					setUsernameMsg(res.message);
				} catch (error) {
					const axiosError = error as AxiosError<ApiResType>;
					setUsernameMsg(axiosError.response?.data.message || "");
				} finally {
					setIsCheckingUsername(false);
				}
			}
		})();
	}, [debouncedUsername]);

	const onSubmit = async (data: z.infer<typeof editProfileSchema>) => {
		setIsSubmitting(true);
		try {
			const { data: res } = await axios.patch("/api/edit-user", data);
			if (res.success) {
				toast.success(res.message);
				window.location.reload();
			} else {
				toast.error(res.message);
			}
		} catch (error) {
			const axiosError = error as AxiosError<ApiResType>;
			toast.error(axiosError.response?.data.message || "Something went wrong");
		} finally {
			setIsSubmitting(false);
		}
	};
	return (
		<Dialog>
			<Tooltip>
				<TooltipTrigger>
					<DialogTrigger asChild>
						<Button variant="default" size="icon" type="button">
							<SquarePen />
						</Button>
					</DialogTrigger>
				</TooltipTrigger>
				<TooltipContent>Edit Profile</TooltipContent>
			</Tooltip>

			<DialogContent className="sm:max-w-[425px]">
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<DialogHeader>
						<DialogTitle>Edit profile</DialogTitle>
						<DialogDescription>
							Make changes to your profile here. Click save when you&apos;re
							done.
						</DialogDescription>
					</DialogHeader>
					<FieldGroup>
						<Controller
							name="name"
							control={form.control}
							render={({ field }) => (
								<Field>
									<FieldLabel htmlFor="name">Full Name</FieldLabel>
									<Input
										{...field}
										id="name"
										placeholder="Name here ... "
										disabled={isSubmitting}
									/>
									<FieldError>{form.formState.errors.name?.message}</FieldError>
								</Field>
							)}
						/>
					</FieldGroup>
					<FieldGroup>
						<Controller
							name="username"
							control={form.control}
							render={({ field }) => (
								<Field>
									<FieldLabel htmlFor="username">Username</FieldLabel>
									<Input
										{...field}
										id="username"
										placeholder="enter a unique username ... "
										onChange={(e) => {
											setUsername(e.target.value);
											field.onChange(e);
										}}
										disabled={isSubmitting}
									/>

									{form.formState.errors.username ? (
										<FieldError>
											{form.formState.errors.username?.message}
										</FieldError>
									) : (
										<FieldDescription
											className={`${!isUsernameAvailable ? "text-destructive" : "text-black"}`}
										>
											{isCheckingUsername ? <Spinner /> : usernameMsg}
										</FieldDescription>
									)}
								</Field>
							)}
						/>
					</FieldGroup>

					<DialogFooter>
						<DialogClose asChild>
							<Button type="button" variant="outline" disabled={isSubmitting}>
								Cancel
							</Button>
						</DialogClose>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Spinner /> Saving
								</>
							) : (
								"Save changes"
							)}{" "}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
