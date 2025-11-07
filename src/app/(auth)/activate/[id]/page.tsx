"use client";
import React, { useEffect, useState } from "react";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { activationCodeSchema } from "@/schemas/auth.schema";
import axios, { AxiosError } from "axios";
import { ApiResType } from "@/lib/APIResponse";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { useParams } from "next/navigation";
import AuthSkeleton from "@/components/skeletons/Auth.Skeleton";
import { useUserStore } from "@/store/user.store";

export default function () {
	const router = useRouter();
	const { isLoadingUser } = useUserStore();

	const { id } = useParams();
	const [otp, setOtp] = useState("");
	const [errors, setErrors] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const onSubmit = async () => {
		setIsLoading(true);

		try {
			const validationRes = activationCodeSchema.safeParse(otp);

			if (!validationRes.success) {
				const zodErrorMsg = JSON.parse(validationRes.error.message)[0].message;
				setErrors(zodErrorMsg);
				setIsLoading(false);
				return;
			}
			const { data: res } = await axios.post("/api/activate-user/", {
				userId: id,
				code: otp,
			});
			if (res.success) {
				toast.success(res.message);
				router.push("/login");
			} else toast.error(res.message);
		} catch (error) {
			const axiosError = error as AxiosError<ApiResType>;
			toast.error(axiosError.response?.data.message || "Something went wrong");
		} finally {
			setIsLoading(false);
		}
	};

	return isLoadingUser ? (
		<AuthSkeleton otpLength={6} showBttomLinks={false} />
	) : (
		<>
			<div className="text-center">
				<h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-2">
					Activate Account
				</h1>
				<p className="mb-4">Enter the activation code send to your email</p>
			</div>
			<div className="flex flex-col items-center gap-5">
				<FieldGroup className="flex flex-col items-center gap-2">
					<FieldLabel>One-Time Password</FieldLabel>
					<InputOTP maxLength={6} value={otp} onChange={(val) => setOtp(val)}>
						<InputOTPGroup>
							<InputOTPSlot index={0} />
							<InputOTPSlot index={1} />
							<InputOTPSlot index={2} />
							<InputOTPSlot index={3} />
							<InputOTPSlot index={4} />
							<InputOTPSlot index={5} />
						</InputOTPGroup>
					</InputOTP>
					<FieldDescription>
						Enter the activation code sent to your email.
					</FieldDescription>
					{errors && <FieldError>{errors}</FieldError>}
				</FieldGroup>

				<Button className="w-full" onClick={onSubmit} disabled={isLoading}>
					{isLoading ? <Spinner /> : "Activate Account"}
				</Button>
			</div>
		</>
	);
}
