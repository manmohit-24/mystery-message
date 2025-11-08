import { Skeleton } from "@/components/ui/skeleton";

export default function () {
	return (
		<nav className="w-full bg-secondary-foreground dark:bg-card fixed top-0  z-100 text-background dark:text-foreground px-6 py-3 flex items-center justify-between">
			{/* App Name Placeholder */}
			<div className="flex items-center gap-2">
				<Skeleton className="h-10 w-12 bg-white rounded-full" />
				<Skeleton className="h-6 w-24 bg-white rounded-md" />
			</div>

			{/* Avatar / Button Placeholder */}
			<div className="flex items-center gap-3">
				<Skeleton className="h-9 w-9 border-2 rounded-full" />
				<Skeleton className="h-10 w-13 bg-white rounded-full" />
			</div>
		</nav>
	);
}
