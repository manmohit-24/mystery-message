"use client";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { logInSchema } from "@/schemas/auth.schema";

import { constants } from "@/lib/constants";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { signIn } from "next-auth/react";
import { Eye, EyeClosed } from "lucide-react";
import Link from "next/link";

export default function () {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errors, setErrors] = useState("");
	const [isLoginAsGuest, setIsLoginAsGuest] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const form = useForm<z.infer<typeof logInSchema>>({
		resolver: zodResolver(logInSchema),
		defaultValues: {
			identifier: "",
			password: "",
		},
	});

	const handleLogin: SubmitHandler<z.infer<typeof logInSchema>> = async (
		data: z.infer<typeof logInSchema>
	) => {
		setIsSubmitting(true);
		const res = await signIn("credentials", {
			...data,
			redirect: false,
		});

		if (res?.error) {
			setErrors(res.error.replace("Error: ", ""));
		} else {
			toast.success("Logged in successfully");
			router.push("/");
		}

		setIsSubmitting(false);
	};

	const handleGuestLogin = async () => {
		setIsSubmitting(true);
		setIsLoginAsGuest(true);
		const res = await signIn("guest", {
			redirect: false,
		});

		if (res?.error) {
			setErrors(res.error.replace("Error: ", ""));
		} else {
			toast.success("Logged in as guest");
			router.push("/");
		}
		setIsSubmitting(false);
		setIsLoginAsGuest(false);
	};

	return (
		<>
			<div className="text-center">
				<h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
					Welcome to {constants.appName}
				</h1>
				<p className="mb-4">Log in to get started</p>
				{errors && <FieldError>{errors}</FieldError>}
			</div>

			<form
				onSubmit={form.handleSubmit(handleLogin)}
				className="flex flex-col gap-5"
			>
				<FieldGroup>
					<Controller
						name="identifier"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field>
								<FieldLabel htmlFor="identifier">Email/Username</FieldLabel>
								<Input
									{...field}
									id="identifier"
									type="text"
									placeholder="sample@example.com"
								/>
								<FieldError>
									{form.formState.errors.identifier?.message}
								</FieldError>
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
										className="absolute right-2 top-1/3 -translate-y-1/2"
										type="button"
										onClick={() => setShowPassword((prev) => !prev)}
									>
										{!showPassword ? <EyeClosed /> : <Eye />}{" "}
									</button>
									<Link
										className="text-left text-sm underline text-blue-500"
										href={"/forgot-password"}
									>
										Forgot Password ?
									</Link>
								</div>
								<FieldError>
									{form.formState.errors.password?.message}
								</FieldError>
							</Field>
						)}
					/>
				</FieldGroup>
				<Button disabled={isSubmitting}>
					{isSubmitting && !isLoginAsGuest && <Spinner />}Login
				</Button>
				<Button
					variant="outline"
					type="button"
					onClick={handleGuestLogin}
					disabled={isSubmitting}
				>
					{isSubmitting && isLoginAsGuest && <Spinner />}Continue as Guest
				</Button>
				<div className="text-center">
					<p>
						Don't have an account ?{" "}
						<Link href="/register" className="underline text-blue-500">
							Register
						</Link>
					</p>
				</div>
			</form>
		</>
	);
}
