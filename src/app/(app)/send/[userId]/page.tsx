"use client";

import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState } from "react";
import { messageReqSchema, MessageReqType } from "@/schemas/message.schema";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { useParams } from "next/navigation";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, Info } from "lucide-react";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { ApiResType } from "@/lib/APIResponse";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import SendMessageSkeleton from "@/components/skeletons/SendMessage.Skeleton";
import { useUserStore } from "@/store/user.store";
import { AIMessageHelper } from "@/components/AIMessageHelper";
import Link from "next/link";

export default function () {
	const { user, isLoadingUser } = useUserStore();

	const [isLoading, setIsLoading] = useState(isLoadingUser);
	const { userId: receiverId } = useParams();

	const form = useForm<MessageReqType>({
		resolver: zodResolver(messageReqSchema),
		defaultValues: {
			content: "",
			isAnonymous: false,
			isTrulyAnonymous: user?._id === "guest" ? true : false,
			receiverId: receiverId?.toString() || "",
		},
	});

	const [isSending, setIsSending] = useState(false);
	const [contentCounter, setContentCounter] = useState(0);
	const [receiver, setReceiver] = useState({
		username: "",
		name: "",
		avatar: "",
		isAcceptingMessage: false,
	});

	useEffect(() => {
		setIsLoading(true);

		if (isLoadingUser) return;
		else if (user?._id === "guest") form.setValue("isTrulyAnonymous", true);

		(async () => {
			try {
				console.log("receiverId :", receiverId);

				const { data: res } = await axios.get(
					`/api/get-user?userId=${receiverId}`
				);
				setReceiver(res.data.user);
			} catch (error) {
				toast.error(`Error occured while fetching receiver`);
			} finally {
				setIsLoading(false);
			}
		})();
	}, [isLoadingUser]);

	const onSubmit: SubmitHandler<MessageReqType> = async (data) => {
		setIsSending(true);
		try {
			const { data: res } = await axios.post("/api/send-message", data);

			if (res.success) {
				toast.success(res.message);
			} else {
				toast.error(res.message);
			}
		} catch (error) {
			const axiosError = error as AxiosError<ApiResType>;
			toast.error(axiosError.response?.data.message || "Something went wrong");
		} finally {
			setIsSending(false);
		}
	};

	useEffect(() => {
		setContentCounter(form.watch("content").length);
	}, [form.watch("content")]);

	return isLoading ? (
		<SendMessageSkeleton />
	) : (
		<div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-background rounded w-full max-w-6xl">
			<div className=" mb-4">
				<h1 className="text-4xl font-bold">
					{receiver.username ? (
						<>
							Just Say it to{" "}
							<span className="text-indigo-600 dark:text-indigo-400">
								{receiver.name}
							</span>
						</>
					) : (
						<span className="text-destructive">Unable to find user</span>
					)}
				</h1>

				{!receiver.username && (
					<span className="text-destructive">
						Seems like either user not exists or there was an internal error
						occured
					</span>
				)}
			</div>

			<Card className="w-full gap-1 ">
				<CardHeader className="pb-3">
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-3">
							<Avatar className="h-10 w-10 bg-foreground rounded-full flex items-center justify-center">
								<AvatarFallback className="text-background font-bold">
									{receiver.name[0]}
								</AvatarFallback>
							</Avatar>

							<div>
								<CardTitle className="text-base font-semibold">
									{receiver.name}
								</CardTitle>
								<CardDescription className="text-xs">
									@{receiver.username}
								</CardDescription>
							</div>
						</div>
					</div>
					<Separator />
				</CardHeader>
				<CardContent>
					<div>
						<form onSubmit={form.handleSubmit(onSubmit)}>
							<Controller
								name="receiverId"
								control={form.control}
								render={({ field }) => (
									<div className="flex items-center space-x-2">
										<input
											{...field}
											value={receiverId}
											disabled={true}
											className="hidden"
										/>
									</div>
								)}
							/>
							<FieldGroup>
								<Controller
									name="content"
									control={form.control}
									render={({ field }) => (
										<Field>
											<FieldLabel htmlFor="content">
												Write Your Message
												{!receiver.isAcceptingMessage && (
													<FieldError>
														({receiver.name} is currently not accepting messages
														)
													</FieldError>
												)}
											</FieldLabel>
											<Textarea
												{...field}
												placeholder="Type your anonymous message here..."
												className="min-h-[120px] resize-none"
												disabled={isSending || !receiver.isAcceptingMessage}
											/>
											<FieldDescription
												className={`${contentCounter < 10 || contentCounter > 500 ? "text-red-500" : ""}`}
											>
												{contentCounter} / 500
											</FieldDescription>

											<FieldError>
												{form.formState.errors.content?.message}
											</FieldError>
										</Field>
									)}
								/>
							</FieldGroup>

							<div className="flex flex-col sm:flex-row gap-5 sm:items-center justify-between mt-4">
								<div className="w-full space-y-4">
									<FieldGroup>
										<Controller
											name="isAnonymous"
											control={form.control}
											render={({ field }) => (
												<Field>
													<div className="flex items-center gap-2 text-nowrap">
														<Switch
															checked={field.value}
															onCheckedChange={field.onChange}
															id="isAnonymous"
															disabled={
																user?._id === "guest" ||
																isSending ||
																!receiver.isAcceptingMessage
															}
														/>
														<FieldLabel
															htmlFor="isAnonymous"
															className="text-sm text-muted-foreground"
														>
															Send anonymously
														</FieldLabel>
														<InfoTooltip content="Stay anonymous while keeping control —receiver will not be able to see but you can still unsend your message later." />
													</div>
													<FieldError>
														{form.formState.errors.isAnonymous?.message}
													</FieldError>
												</Field>
											)}
										/>
									</FieldGroup>
									<FieldGroup>
										<Controller
											name="isTrulyAnonymous"
											control={form.control}
											render={({ field }) => (
												<Field>
													<div className="flex flex-row items-center gap-2 text-nowrap">
														<Switch
															checked={field.value}
															onCheckedChange={field.onChange}
															id="isTrulyAnonymous"
															disabled={
																user?._id === "guest" ||
																isSending ||
																!receiver.isAcceptingMessage
															}
														/>
														<FieldLabel
															htmlFor="isTrulyAnonymous"
															className="text-sm text-muted-foreground"
														>
															Send Truely Anonymously
														</FieldLabel>
														<InfoTooltip content="Go fully invisible — this message is completely detached from your account for total privacy and freedom. Can't be unsent later" />
													</div>
													<FieldError>
														{form.formState.errors.isTrulyAnonymous?.message}
													</FieldError>
													{user?._id === "guest" && (
														<FieldDescription className="w-full flex items-center text-indigo-500 italic">
															<Info className="h-4 w-4 mr-1" />
															Guest user can only send truly anonymous messages
														</FieldDescription>
													)}
												</Field>
											)}
										/>
									</FieldGroup>
								</div>
								<div className="flex items-center">
									<Button
										type="submit"
										className="px-6 font-medium"
										disabled={
											user?._id === receiverId ||
											isSending ||
											!receiver.isAcceptingMessage
										}
									>
										{isSending ? (
											<>
												<Spinner /> Sending...
											</>
										) : (
											"Send Message"
										)}
									</Button>
									{user?._id === receiverId && (
										<InfoTooltip
											content="You can't send a message to yourself"
											iconClassName={
												"h-5 w-5 text-destructive/50 hover:text-destructive"
											}
										/>
									)}
								</div>
							</div>
						</form>
					</div>
				</CardContent>
			</Card>

			<Separator className="mt-6" />

			<AIMessageHelper onUse={(msg) => form.setValue("content", msg)} />

			<Separator className="mt-6" />
			<div className="w-full flex justify-center mt-10">
				<Link href={user ? "/dashboard" : "/login"}>
					<Button
						variant={"outline"}
						className="h-10 text-md border-2 border-indigo-600/50 dark:border-indigo-400/30 text-indigo-600 dark:text-indigo-400 hover:text-white dark:hover:text-white hover:bg-indigo-600 dark:hover:bg-indigo-600"
					>
						Click Here to Get Your Just-Say Link
					</Button>
				</Link>
			</div>
		</div>
	);
}

const InfoTooltip = ({
	content,
	iconClassName = "",
}: {
	content: string;
	iconClassName?: string;
}) => (
	<TooltipProvider>
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					className="ml-1 text-muted-foreground hover:text-foreground"
				>
					<HelpCircle className={`h-4 w-4 ${iconClassName}`} />
				</button>
			</TooltipTrigger>
			<TooltipContent className="max-w-xs text-sm">{content}</TooltipContent>
		</Tooltip>
	</TooltipProvider>
);
