import { Skeleton } from "@/components/ui/skeleton";

export default function () {
	return (
		<nav className="w-full border-b bg-secondary-foreground fixed top-0 z-100 text-background px-6 py-3 shadow-sm flex items-center justify-between">
			{/* App Name Placeholder */}
			<div className="flex items-center gap-2">
				<Skeleton className="h-6 w-24 rounded-md" />
			</div>

			{/* Avatar / Button Placeholder */}
			<div className="flex items-center gap-3">
				<Skeleton className="h-10 w-10 rounded-full" />
			</div>
		</nav>
	);
}
