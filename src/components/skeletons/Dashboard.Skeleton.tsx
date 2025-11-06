import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import MessageCardSkeleton from "./MessageCard.Skeleton";
import ProfileHeaderSkeleton from "./ProfileHeader.Skeleton";
import { Spinner } from "../ui/spinner";
export default function () {
	return (
		<div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-background rounded w-full max-w-6xl">
			{/* Title */}
			<Skeleton className="h-8 w-48 mb-4" />

			{/* Profile Header Placeholder */}
			<div className="flex items-center gap-4 mb-6">
				<ProfileHeaderSkeleton />
			</div>

			<Separator className="mb-6" />

			{/* Tabs */}
			<div className="flex mx-auto w-fit gap-3 mb-6">
				<Skeleton className="h-8 w-24 rounded-md" />
				<Skeleton className="h-8 w-24 rounded-md" />
			</div>

			{/* Section header */}
			<div className="flex gap-2 mx-auto w-fit items-center my-2">
				<Skeleton className="h-5 w-40" />
				<Skeleton className="h-5 w-5 rounded-full" />
			</div>

			{/* Message cards grid */}
			<div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
				{Array.from({ length: 4 }).map((_, i) => (
					<MessageCardSkeleton key={i} />
				))}
			</div>
			<Spinner className="mt-4 mx-auto size-8 opacity-30" />
		</div>
	);
}
