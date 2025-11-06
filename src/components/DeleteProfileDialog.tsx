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
import { Trash2, Eye, EyeClosed } from "lucide-react";
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
import { passwordValidation } from "@/schemas/auth.schema";
import axios, { AxiosError } from "axios";
import { ApiResType } from "@/lib/APIResponse";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { Spinner } from "./ui/spinner";
import z from "zod";
import { signOut } from "next-auth/react";

const schema = z.object({
	password: passwordValidation,
});

export default function DeleteProfileDialog() {
	const [showPassword, setShowPassword] = useState(false);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const form = useForm({
		resolver: zodResolver(schema),
	});

	const onSubmit = async (data: z.infer<typeof schema>) => {
		setIsSubmitting(true);
		try {
			const { data: res } = await axios.patch("/api/delete-user", data);
			if (res.success) {
                toast.success(res.message);
                toast.warning("You will be logged out now");
                signOut({ callbackUrl: "/" });
				
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
						<Button
							variant="outline"
							size="icon"
							type="button"
							className="border-destructive/50 text-destructive hover:bg-destructive dark:hover:bg-destructive  hover:text-background"
						>
							<Trash2 />
						</Button>
					</DialogTrigger>
				</TooltipTrigger>
				<TooltipContent color="bg-destructive fill-destructive text-background font-bold">
					Delete Profile
				</TooltipContent>
			</Tooltip>

			<DialogContent className="sm:max-w-[425px]">
				<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5" >
					<DialogHeader>
						<DialogTitle>Delete profile ?</DialogTitle>
						<DialogDescription>
							Your account will be deactivated for 7 days before permanent
							deletion. You can log in anytime during this period to restore it.
						</DialogDescription>
					</DialogHeader>
					<FieldGroup>
						<Controller
							name="password"
							control={form.control}
							render={({ field }) => (
								<Field>
									<FieldLabel htmlFor="password">Enter your password to confirm deletion</FieldLabel>
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

					<DialogFooter>
						<DialogClose asChild>
							<Button type="button" variant="outline" disabled={isSubmitting}>
								Cancel
							</Button>
						</DialogClose>
						<Button type="submit" variant={"destructive"} className="font-bold" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Spinner /> Saving
								</>
							) : (
								"Confirm Deletion"
							)}{" "}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
