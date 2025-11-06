import { Skeleton } from "@/components/ui/skeleton";

export default function() {
	return (
		<div className="flex flex-col items-center justify-center h-[80vh] gap-6 text-center">
			{/* App logo / name placeholder */}
			<Skeleton className="h-10 w-40 rounded-md" />

			{/* Short tagline or description */}
			<div className="space-y-2">
				<Skeleton className="h-4 w-64 mx-auto" />
				<Skeleton className="h-4 w-48 mx-auto" />
			</div>

			{/* Fake button or action area */}
			<div className="flex gap-4 mt-4">
				<Skeleton className="h-10 w-28 rounded-md" />
				<Skeleton className="h-10 w-28 rounded-md" />
			</div>
		</div>
	);
}
