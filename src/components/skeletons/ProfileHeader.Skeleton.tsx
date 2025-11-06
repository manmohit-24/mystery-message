import {
	Card,
	CardContent,
	CardHeader,
} from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";

export default function() {
	return (
		<Card className="w-full gap-1 shadow-sm border-none">
			<CardHeader className="pb-3">
				<div className="flex justify-between">
					{/* Left side: avatar + name */}
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-3">
							{/* Avatar */}
							<Skeleton className="h-10 w-10 rounded-full" />

							{/* Name + username */}
							<div className="flex flex-col gap-1">
								<Skeleton className="h-4 w-24" /> {/* Name */}
								<Skeleton className="h-3 w-16" /> {/* @username */}
							</div>
						</div>
					</div>

					{/* Right side: buttons */}
					<div className="flex gap-3">
						<Skeleton className="h-8 w-8 rounded-md" />
						<Skeleton className="h-8 w-8 rounded-md" />
					</div>
				</div>
			</CardHeader>

			<CardContent>
				{/* Label */}
				<Skeleton className="h-3 w-48 mb-2" />

				{/* Link box */}
				<div className="flex items-center justify-between bg-background border border-border rounded-lg px-3 py-2">
					<Skeleton className="h-4 w-40" />
					<div className="flex gap-2 ml-2">
						<Skeleton className="h-8 w-8 rounded-md" />
					</div>
				</div>

				{/* Switch section */}
				<div className="flex items-center gap-3 mt-4">
					<Skeleton className="h-5 w-9 rounded-full" /> {/* Switch */}
					<Skeleton className="h-4 w-24" /> {/* Label text */}
				</div>
			</CardContent>
		</Card>
	);
}
