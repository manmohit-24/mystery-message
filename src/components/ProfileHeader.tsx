"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { useForm, Controller } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { acceptMessageSchema } from "@/schemas/message.schema";
import axios, { AxiosError } from "axios";
import { ApiResType } from "@/lib/APIResponse";
import { Copy } from "lucide-react";
import EditProfileDialog from "./EditProfileDialog";
import ProfileHeaderSkeleton from "./skeletons/ProfileHeader.Skeleton";
import { useUserStore } from "@/store/user.store";
import DeleteProfileDialog from "./DeleteProfileDialog";

export default function ProfileHeader() {
	const [isSwitchLoading, setIsSwitchLoading] = useState(false);

	const { user, isLoadingUser } = useUserStore();

	const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL}/u/${user?._id}`;
	const form = useForm({
		resolver: zodResolver(acceptMessageSchema),
		defaultValues: {
			isAcceptingMessage: user?.isAcceptingMessage || true,
		},
	});

	const isAcceptingMessage = form.watch("isAcceptingMessage");

	const handleCopy = async () => {
		navigator.clipboard.writeText(profileUrl);
		toast.success("Copied to clipboard");
	};

	const handleAcceptMsgSwitchToggle = async () => {
		setIsSwitchLoading(true);
		try {
			const { data: res } = await axios.post(`api/accept-messages`, {
				acceptMessages: isAcceptingMessage,
			});

			if (!res.success) {
				form.setValue("isAcceptingMessage", !isAcceptingMessage);
			}
		} catch (error) {
			const axiosError = error as AxiosError<ApiResType>;
			toast.error(axiosError.response?.data.message || "Something went wrong");
		} finally {
			setIsSwitchLoading(false);
		}
	};

	return isLoadingUser ? (
		<ProfileHeaderSkeleton />
	) : (
		<>
			<Card className="w-full gap-1 shadow-sm border-none">
				<CardHeader className="pb-3">
					<div className="flex justify-between">
						<div className="flex items-start justify-between">
							<div className="flex items-center gap-3">
								<Avatar className="h-10 w-10 bg-foreground rounded-full flex items-center justify-center">
									<AvatarFallback className="text-background font-bold bg-transparent">
										{user?.name && user.name[0]}
									</AvatarFallback>
								</Avatar>
								<div>
									<CardTitle className="text-base font-semibold">
										{user?.name}
									</CardTitle>
									<CardDescription className="text-xs">
										@{user?.username}
									</CardDescription>
								</div>
							</div>
						</div>
						<div className="flex gap-3">
							<EditProfileDialog />
							<DeleteProfileDialog />
						</div>
					</div>
				</CardHeader>

				<CardContent>
					<p className="text-sm text-muted-foreground mb-1">
						Your anonymous message link:
					</p>
					<div className="flex items-center justify-between bg-background border border-border rounded-lg px-3 py-2">
						<span className="truncate text-sm">{profileUrl}</span>
						<div className="flex gap-2 ml-2">
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="outline"
										size="icon"
										onClick={handleCopy}
										title="Copy link"
									>
										<Copy className="h-4 w-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>Copy to clipboard</TooltipContent>
							</Tooltip>
						</div>
					</div>

					<form
						onSubmit={form.handleSubmit(handleAcceptMsgSwitchToggle)}
						className="mt-4"
					>
						<Controller
							name="isAcceptingMessage"
							control={form.control}
							render={({ field }) => (
								<>
									<Switch
										checked={field.value}
										onCheckedChange={field.onChange}
										disabled={isSwitchLoading}
										type="submit"
									/>
									<span className="ml-2">
										Accept Messages: {isAcceptingMessage ? "On" : "Off"}
									</span>
								</>
							)}
						/>
					</form>
				</CardContent>
			</Card>
		</>
	);
}
