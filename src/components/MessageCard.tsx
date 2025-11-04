import React, { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	MoreVertical,
	Trash2,
	Undo2,
	Check,
	CheckCheck,
	Clock,
	XCircle,
	Eye,
	BellDot,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { MessageResType } from "@/schemas/message.schema";
import axios, { AxiosError } from "axios";
import { ApiResType } from "@/lib/APIResponse";
import { toast } from "sonner";

function getBadge(status: string, role: string) {
	if (role !== "sender" && role !== "receiver") return <></>;

	const baseStyle = "px-2 py-1 text-[10px] font-bold uppercase";
	const isSender = role === "sender";

	switch (status) {
		case "failed":
			return isSender ? (
				<Badge className={`${baseStyle} bg-red-400/15 text-red-700`}>
					<XCircle /> Failed
				</Badge>
			) : (
				<Badge className={`${baseStyle} bg-amber-400/20 text-amber-800`}>
					<Clock /> Waiting
				</Badge>
			);
		case "sent":
			return (
				<Badge className={`${baseStyle} bg-purple-500/15 text-purple-500`}>
					{isSender ? (
						<>
							<Check /> Sent
						</>
					) : (
						<>
							<BellDot /> New
						</>
					)}
				</Badge>
			);
		case "read":
			return (
				<Badge className={`${baseStyle}   bg-sky-500/15 text-sky-500`}>
					<CheckCheck /> Read
				</Badge>
			);
		default:
			return (
				<Badge className={`${baseStyle} bg-gray-200 text-gray-700`}>
					<Clock /> Pending
				</Badge>
			);
	}
}

export default function MessageCard({
	message,
	role,
	handleMsgDelete,
}: {
	message: MessageResType;
	role: string;
	handleMsgDelete: ({
		messageId,
		role,
	}: {
		messageId: string;
		role: string;
	}) => void;
}) {
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showUnsendDialog, setShowUnsendDialog] = useState(false);

	if (!role || (role !== "sender" && role !== "receiver")) return <></>;

	const displayUser = role === "sender" ? message.receiver : message.sender;
	const statusBadge = getBadge(message.status, role);

	const handleDelete = async () => {
		console.log("Deleting message:", message._id);
		try {
			const { data: res } = await axios.delete(
				`/api/delete-message-for-user?messageId=${message._id}`
			);
			if (res.success) {
				toast.success(res.message);
				handleMsgDelete({ messageId: message._id, role });
			} else toast.error(res.message);
		} catch (error) {
			const axiosError = error as AxiosError<ApiResType>;
			toast.error(axiosError.response?.data.message || "Something went wrong");
		} finally {
			setShowDeleteDialog(false);
		}
	};

	const handleUnsend = async () => {
		console.log("Unsending message:", message._id);
		try {
			const { data: res } = await axios.delete(
				`/api/unsend-message?messageId=${message._id}`
			);
			if (res.success) toast.success(res.message);
			else toast.error(res.message);
		} catch (error) {
			const axiosError = error as AxiosError<ApiResType>;
			toast.error(axiosError.response?.data.message || "Something went wrong");
		} finally {
			setShowUnsendDialog(false);
		}
	};

	return (
		<>
			<Card className="w-full max-w-2xl hover:shadow-md transition-shadow gap-0">
				<CardHeader className="pb-3">
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-3">
							<Avatar className="h-10 w-10">
								{/* <AvatarImage src={displayUser.avatar} alt={displayUser.name[0]} /> */}
								<AvatarFallback>{displayUser.name[0]}</AvatarFallback>
							</Avatar>
							<div>
								<CardTitle className="text-base font-semibold">
									{displayUser.name}
								</CardTitle>
								<CardDescription className="text-xs">
									@{displayUser.username}
								</CardDescription>
							</div>
						</div>

						<div className="flex items-center gap-2">
							{statusBadge}

							<DropdownMenu>
								<DropdownMenuTrigger className="focus:outline-none hover:bg-gray-100 rounded-full p-1 transition-colors">
									<MoreVertical className="h-5 w-5 text-gray-500" />
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									{role === "sender" && (
										<DropdownMenuItem
											onClick={() => setShowUnsendDialog(true)}
											className="cursor-pointer text-orange-600"
										>
											<Undo2 className="mr-2 h-4 w-4" />
											<span>Unsend Message</span>
										</DropdownMenuItem>
									)}
									<DropdownMenuItem
										onClick={() => setShowDeleteDialog(true)}
										className="cursor-pointer text-red-600"
									>
										<Trash2 className="mr-2 h-4 w-4" />
										<span>Delete Message</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</CardHeader>

				<CardContent>
					<p className="text-sm text-gray-700 mb-3">{message.content}</p>

					<div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
						<div className="flex items-center gap-1">
							<Clock className="h-3 w-3" />
							<span>
								{formatDistanceToNow(new Date(message.createdAt), {
									addSuffix: true,
								})}
							</span>
						</div>
					</div>
				</CardContent>
			</Card>

			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete this message?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the
							message from your view.
							{role === "sender" && " The sender will still be able to see it."}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-red-600 hover:bg-red-700"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog open={showUnsendDialog} onOpenChange={setShowUnsendDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Unsend this message?</AlertDialogTitle>
						<AlertDialogDescription>
							This will remove the message for both you and the recipient. This
							action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleUnsend}
							className="bg-orange-600 hover:bg-orange-700"
						>
							Unsend
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
