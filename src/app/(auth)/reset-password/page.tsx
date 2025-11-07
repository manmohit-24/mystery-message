"use client";
import React, { use, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { passwordValidation } from "@/schemas/auth.schema";
import axios, { AxiosError } from "axios";
import { ApiResType } from "@/lib/APIResponse";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Eye, EyeClosed } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import AuthSkeleton from "@/components/skeletons/Auth.Skeleton";
import { useUserStore } from "@/store/user.store";

const schema = z
	.object({
		newPassword: passwordValidation,
		confirmNewPassword: z.string(),
	})
	.refine((data) => data.newPassword === data.confirmNewPassword, {
		message: "Passwords do not match",
		path: ["confirmNewPassword"],
	});

export default function () {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ResetPasswordForm />
		</Suspense>
	);
}

function ResetPasswordForm() {
	const router = useRouter();
	const { isLoadingUser } = useUserStore();

	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const userId = searchParams.get("userId");

	useEffect(() => {
		if (!token || !userId) {
			router.replace("/");
		}
	}, [token, userId]);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			newPassword: "",
			confirmNewPassword: "",
		},
	});

	const onSubmit: SubmitHandler<z.infer<typeof schema>> = async (
		data: z.infer<typeof schema>
	) => {
		setIsSubmitting(true);
		try {
			const { data: res } = await axios.post("/api/reset-password", {
				userId,
				token,
				newPassword: data.newPassword,
			});

			if (res.success) {
				toast.success(res.message);
				router.push("/login");
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

	return isLoadingUser ? (
		<AuthSkeleton fieldsCount={2} showBttomLinks={false} />
	) : (
		<>
			<div className="text-center">
				<h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-2">
					Reset Password
				</h1>
				<p className="mb-4">Enter your new password</p>
			</div>

			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-5"
			>
				<FieldGroup>
					<Controller
						name="newPassword"
						control={form.control}
						render={({ field }) => (
							<Field>
								<FieldLabel htmlFor="newPassword">New Password</FieldLabel>
								<div className="relative text-right">
									<Input
										{...field}
										id="newPassword"
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
									{form.formState.errors.newPassword?.message}
								</FieldError>
							</Field>
						)}
					/>
				</FieldGroup>
				<FieldGroup>
					<Controller
						name="confirmNewPassword"
						control={form.control}
						render={({ field }) => (
							<Field>
								<FieldLabel htmlFor="confirmNewPassword">
									Confirm New Password
								</FieldLabel>
								<div className="relative text-right">
									<Input
										{...field}
										id="confirmNewPassword"
										type={showConfirmPassword ? "text" : "password"}
										placeholder="********"
									/>

									<button
										className="absolute right-2 top-1/2 -translate-y-1/2"
										type="button"
										onClick={() => setShowConfirmPassword((prev) => !prev)}
									>
										{!showConfirmPassword ? <EyeClosed /> : <Eye />}{" "}
									</button>
								</div>
								<FieldError>
									{form.formState.errors.confirmNewPassword?.message}
								</FieldError>
							</Field>
						)}
					/>
				</FieldGroup>
				<Button disabled={isSubmitting}>
					{isSubmitting && <Spinner />} Continue
				</Button>
			</form>
		</>
	);
}
