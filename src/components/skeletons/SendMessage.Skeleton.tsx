import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function () {
	return (
		<div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-background rounded w-full max-w-6xl">
			{/* Page Title */}
			<Skeleton className="h-8 w-64 mb-4" />

			<Card className="w-full gap-1">
				<CardHeader className="pb-3">
					{/* User Info */}
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-3">
							<Skeleton className="h-10 w-10 rounded-full" />
							<div className="space-y-2">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-3 w-24" />
							</div>
						</div>
					</div>
					<Separator className="mt-4" />
				</CardHeader>

				<CardContent>
					{/* Textarea */}
					<div className="space-y-4">
						<div className="space-y-2">
							<Skeleton className="h-4 w-40" />
							<Skeleton className="h-[120px] w-full rounded-md" />
							<Skeleton className="h-3 w-16" />
						</div>

						{/* Switches */}
						<div className="flex flex-col gap-4 mt-4">
							<div className="flex items-center gap-2">
								<Skeleton className="h-5 w-9 rounded-full" />
								<Skeleton className="h-4 w-40" />
								<Skeleton className="h-4 w-4 rounded-full" />
							</div>

							<div className="flex items-center gap-2">
								<Skeleton className="h-5 w-9 rounded-full" />
								<Skeleton className="h-4 w-56" />
								<Skeleton className="h-4 w-4 rounded-full" />
							</div>
						</div>

						{/* Submit Button */}
						<div className="flex justify-end mt-6">
							<Skeleton className="h-10 w-32 rounded-md" />
						</div>
					</div>
				</CardContent>
			</Card>

			<Separator className="mt-6" />
		</div>
	);
}
