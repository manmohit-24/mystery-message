"use client";
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { useDebounceValue } from "usehooks-ts";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { registerSchema } from "@/schemas/auth.schema";
import axios, { AxiosError } from "axios";
import { ApiResType } from "@/lib/APIResponse";
import { constants } from "@/lib/constants";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { Eye, EyeClosed } from "lucide-react";
import AuthSkeleton from "@/components/skeletons/Auth.Skeleton";
import { useUserStore } from "@/store/user.store";

export default function () {
	const router = useRouter();
	const { isLoadingUser } = useUserStore();

	const [username, setUsername] = useState("");
	const [usernameMsg, setUsernameMsg] = useState("");
	const [isUsernameAvailable, setIsUsernameAvailable] = useState(false);
	const [debouncedUsername, setDebouncedUsername] = useDebounceValue(
		username,
		500
	);
	const [isCheckingUsername, setIsCheckingUsername] = useState(false);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const form = useForm<z.infer<typeof registerSchema>>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			username: "",
			email: "",
			password: "",
		},
	});

	const onSubmit: SubmitHandler<z.infer<typeof registerSchema>> = async (
		data: z.infer<typeof registerSchema>
	) => {
		setIsSubmitting(true);
		try {
			const { data: res } = await axios.post("/api/register", data);
			if (res.success) {
				toast.success(res.message);
				router.push(`/activate/${res.data.id}`);
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

	return isLoadingUser ? (
		<AuthSkeleton fieldsCount={4} />
	) : (
		<>
			<div className="text-center">
				<h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-2">
					Join {constants.appName}
				</h1>
				<p className="mb-4">Sign up to get started</p>
			</div>

			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-5"
			>
				<FieldGroup>
					<Controller
						name="name"
						control={form.control}
						render={({ field }) => (
							<Field>
								<FieldLabel htmlFor="name">Full Name</FieldLabel>
								<Input {...field} id="name" placeholder="Name here ... " />
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
				<FieldGroup>
					<Controller
						name="email"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field>
								<FieldLabel htmlFor="email">Email</FieldLabel>
								<Input
									{...field}
									id="email"
									type="email"
									placeholder="sample@example.com"
								/>
								<FieldError>{form.formState.errors.email?.message}</FieldError>
							</Field>
						)}
					/>
				</FieldGroup>
				<FieldGroup>
					<Controller
						name="password"
						control={form.control}
						render={({ field }) => (
							<Field>
								<FieldLabel htmlFor="password">Password</FieldLabel>
								<div className="relative text-right">
									<Input
										{...field}
										id="password"
										type={showPassword ? "text" : "password"}
										placeholder="********"
									/>

									<button
										className="absolute right-2 top-1/2 -translate-y-1/2"
										type="button"
										onClick={() => setShowPassword((prev) => !prev)}
									>
										{!showPassword ? <EyeClosed /> : <Eye />}{" "}
									</button>
								</div>
								<FieldError>
									{form.formState.errors.password?.message}
								</FieldError>
							</Field>
						)}
					/>
				</FieldGroup>
				<Button disabled={isSubmitting}>
					{isSubmitting && <Spinner />} Register
				</Button>

				<div className="text-center">
					<p>
						Already have an account ?{" "}
						<Link href="/login" className="underline text-blue-500">
							Login
						</Link>
					</p>
				</div>
			</form>
		</>
	);
}
