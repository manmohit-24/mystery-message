"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RefreshCcw } from "lucide-react";
import MessageCard from "@/components/MessageCard";
import { MessageResType } from "@/schemas/message.schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiResType } from "@/lib/APIResponse";
import { Spinner } from "@/components/ui/spinner";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import ProfileHeader from "@/components/ProfileHeader";
import DashboardSkeleton from "@/components/skeletons/Dashboard.Skeleton";

export default function () {
	const [isFetchingMessages, setIsFetchingMessages] = useState(false);
	const [sentMessages, setSentMessages]: [MessageResType[], any] = useState([]);
	const [receivedMessages, setReceivedMessages]: [MessageResType[], any] =
		useState([]);
	const [isLoading, setIsLoading] = useState(false);

	const receivedCursor = useRef<string>("");
	const sentCursor = useRef<string>("");
	const [canFetchMoreReceivedMsg, setCanFetchMoreReceivedMsg] = useState(true);
	const [canFetchMoreSentMsg, setCanFetchMoreSentMsg] = useState(true);
	const receivedObserverRef = useRef<HTMLDivElement | null>(null);
	const sentObserverRef = useRef<HTMLDivElement | null>(null);
	const [currentTab, setCurrentTab] = useState("received");

	const fetchSentMessages = useCallback(
		async (isRefresh: boolean = false) => {
			setIsFetchingMessages(true);
			try {
				if (isRefresh) setSentMessages([]);
				else if (sentCursor.current === null) {
					setCanFetchMoreSentMsg(false);
					return;
				}
				setCanFetchMoreSentMsg(true);

				const cursor: string = isRefresh ? "" : sentCursor.current;
				const { data: res } = await axios.get(
					`api/get-messages?role=sender&cursor=${cursor}`
				);

				if (res.success) {
					const nextCursor = res.data.nextCursor;

					if (nextCursor !== cursor) {
						sentCursor.current = nextCursor;

						setSentMessages((prev: MessageResType[]) =>
							isRefresh ? res.data.messages : prev.concat(res.data.messages)
						);
					}
				}
			} catch (error) {
				const axiosError = error as AxiosError<ApiResType>;
				toast.error(
					axiosError.response?.data.message || "Something went wrong"
				);
			} finally {
				setIsFetchingMessages(false);
			}
		},
		[sentCursor]
	);

	const fetchReceivedMessages = useCallback(
		async (isRefresh: boolean = false) => {
			setIsFetchingMessages(true);
			try {
				if (isRefresh) setReceivedMessages([]);
				else if (receivedCursor.current === null) {
					setCanFetchMoreReceivedMsg(false);
					return;
				}
				setCanFetchMoreReceivedMsg(true);

				const cursor: string = isRefresh ? "" : receivedCursor.current;
				const { data: res } = await axios.get(
					`api/get-messages?role=receiver&cursor=${cursor}`
				);

				if (res.success) {
					const nextCursor = res.data.nextCursor;

					if (nextCursor !== cursor) {
						receivedCursor.current = nextCursor;

						setReceivedMessages((prev: MessageResType[]) =>
							isRefresh ? res.data.messages : prev.concat(res.data.messages)
						);
					}
				}
			} catch (error) {
				const axiosError = error as AxiosError<ApiResType>;
				toast.error(
					axiosError.response?.data.message || "Something went wrong"
				);
			} finally {
				setIsFetchingMessages(false);
			}
		},
		[receivedCursor]
	);

	useEffect(() => {
		(async () => {
			setIsLoading(true);
			await fetchReceivedMessages(true);
			await fetchSentMessages(true);
			setIsLoading(false);
		})();
	}, []);

	useEffect(() => {
		const receivedObserver = new IntersectionObserver(
			async (entries) => {
				const firstEntry = entries[0];

				if (
					firstEntry.isIntersecting &&
					!isFetchingMessages &&
					canFetchMoreReceivedMsg
				)
					await fetchReceivedMessages();
			},
			{
				root: null,
				threshold: 0.1,
			}
		);

		const sentObserver = new IntersectionObserver(
			async (entries) => {
				const firstEntry = entries[0];
				if (
					firstEntry.isIntersecting &&
					!isFetchingMessages &&
					canFetchMoreSentMsg
				)
					await fetchSentMessages();
			},
			{
				root: null,
				threshold: 0.1,
			}
		);

		if (receivedObserverRef.current)
			receivedObserver.observe(receivedObserverRef.current);

		if (sentObserverRef.current) sentObserver.observe(sentObserverRef.current);

		return () => {
			if (receivedObserverRef.current)
				receivedObserver.unobserve(receivedObserverRef.current);

			if (sentObserverRef.current)
				sentObserver.unobserve(sentObserverRef.current);
		};
	}, [
		isLoading,
		isFetchingMessages,
		canFetchMoreReceivedMsg,
		canFetchMoreSentMsg,
		receivedObserverRef,
		sentObserverRef,
		currentTab,
	]);

	const handleMsgDelete = ({
		messageId,
		role,
	}: {
		messageId: string;
		role: string;
	}) => {
		if (role === "sender") {
			setSentMessages((prev: MessageResType[]) =>
				prev.filter((msg: MessageResType) => msg._id !== messageId)
			);
		} else if (role === "receiver") {
			setReceivedMessages((prev: MessageResType[]) =>
				prev.filter((msg: MessageResType) => msg._id !== messageId)
			);
		}
	};

    const tabsClassName =
			"p-4 data-[state=active]:bg-secondary  dark:data-[state=active]:bg-secondary data-[state=active]:text-foreground rounded-4xl dark:text-background text-background ";

	return isLoading ? (
		<DashboardSkeleton />
	) : (
		<div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-background rounded w-full max-w-6xl space-y-5">
			<h1 className="text-4xl font-bold mb-4">User Dashboard</h1>
			<ProfileHeader />

			<Separator />

			<Tabs defaultValue={currentTab}>
				<TabsList className="py-5 mx-auto bg-foreground dark:bg-foreground/80 rounded-4xl ">
					<TabsTrigger
						onClick={() => setCurrentTab("received")}
						value="received"
						className={tabsClassName}
					>
						Received
					</TabsTrigger>
					<TabsTrigger
						onClick={() => setCurrentTab("sent")}
						value="sent"
						className={tabsClassName}
					>
						Send
					</TabsTrigger>
				</TabsList>
				<TabsContent value="received">
					<div className="flex gap-2 items-center mx-auto w-fit my-2">
						<h2 className="text-lg font-semibold ">Messages I Received</h2>
						<RefreshButton
							callback={fetchReceivedMessages}
							isFetchingMessages={isFetchingMessages}
						/>
					</div>
					<div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
						{receivedMessages.map((message) => (
							<MessageCard
								key={message._id}
								message={message}
								role="receiver"
								handleMsgDelete={handleMsgDelete}
							/>
						))}
					</div>
					<LoadMore
						observerRef={receivedObserverRef}
						callback={fetchReceivedMessages}
						canFetchMore={canFetchMoreReceivedMsg}
						isFetchingMessages={isFetchingMessages}
					/>
				</TabsContent>
				<TabsContent value="sent">
					<div className="flex gap-2 items-center mx-auto w-fit my-2">
						<h2 className="text-lg font-semibold ">Messages Sent By Me </h2>

						<RefreshButton
							callback={fetchSentMessages}
							isFetchingMessages={isFetchingMessages}
						/>
					</div>
					<div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
						{sentMessages.map((message) => (
							<MessageCard
								key={message._id}
								message={message}
								role="sender"
								handleMsgDelete={handleMsgDelete}
							/>
						))}
					</div>
					<LoadMore
						observerRef={sentObserverRef}
						callback={fetchSentMessages}
						isFetchingMessages={isFetchingMessages}
						canFetchMore={canFetchMoreSentMsg}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}

const RefreshButton = ({
	callback = (isRefresh: boolean) => {},
	isFetchingMessages,
}: {
	callback: (isRefresh: boolean) => void;
	isFetchingMessages: boolean;
}) => {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="secondary"
					size="icon"
					onClick={() => callback(true)}
					disabled={isFetchingMessages}
				>
					<RefreshCcw
						className={`h-4 w-4 ${isFetchingMessages && "animate-spin"}`}
					/>
				</Button>
			</TooltipTrigger>
			<TooltipContent>Refresh</TooltipContent>
		</Tooltip>
	);
};

const LoadMore = ({
	observerRef,
	callback,
	isFetchingMessages,
	canFetchMore,
}: {
	observerRef: React.RefObject<HTMLDivElement | null>;
	callback: (isRefresh: boolean) => void;
	isFetchingMessages: boolean;
	canFetchMore: boolean;
}) => {
	return (
		<div ref={observerRef} className="flex flex-col items-center">
			<Button
				className="translate-y-[75%]"
				variant="outline"
				onClick={() => callback(false)}
				disabled={!canFetchMore}
			>
				{isFetchingMessages && <Spinner />}
				{canFetchMore
					? isFetchingMessages
						? "Loading"
						: "Load More"
					: "No More Messages"}
			</Button>

			<Separator className="mt-2" />
		</div>
	);
};
