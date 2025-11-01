"use client";
import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
import Link from "next/link";

export default function () {
	const router = useRouter();

	const [email, setEmail] = useState("");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const onSubmit = async () => {
		setIsSubmitting(true);
		setError("");
		try {
			const { data: res } = await axios.get(
				`/api/request-forgot-password?email=${email}`
			);
			if (res.success) {
				toast.info(res.message);
				router.push(`/login`);
			} else {
				setError(res.message);
			}
		} catch (error) {
			const axiosError = error as AxiosError<ApiResType>;
			setError(axiosError.response?.data.message || "Something went wrong");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<>
			<div className="text-center">
				<h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
					Request Password Reset
				</h1>
				<p className="mb-4">Enter your email to reset your password</p>
			</div>

			<div className="flex flex-col gap-5">
				<FieldGroup>
					<Field>
						<FieldLabel htmlFor="name">Email</FieldLabel>
						<Input
							type="email"
							id="email"
							placeholder="sample@example.com"
							onChange={(e) => setEmail(e.target.value)}
							value={email}
						/>
						<FieldError>{error}</FieldError>
					</Field>
				</FieldGroup>

				<Button disabled={isSubmitting} onClick={onSubmit}>
                    {isSubmitting && <Spinner />} Continue
				</Button>

				<div className="text-center">
					<p>
						Back to{" "}
						<Link href="/login" className="underline text-blue-500">
							Login
						</Link>
					</p>
				</div>
			</div>
		</>
	);
}
