import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function HomeSkeleton() {
	return (
		<main className="h-full flex flex-col bg-background text-foreground">
			{/* HERO */}
			<section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-35">
				<div className="flex flex-col items-center gap-5">
					{/* Logo */}
					<Skeleton className="h-30 w-30 rounded-full" />
					{/* App Name */}
					<Skeleton className="h-10 w-64 rounded-md" />
				</div>

				{/* Tagline */}
				<Skeleton className="h-6 w-80 rounded-md mt-4" />

				{/* Description */}
				<Skeleton className="h-4 w-96 rounded-md mt-4" />
				<Skeleton className="h-4 w-80 rounded-md mt-2" />

				{/* Button */}
				<Skeleton className="h-10 w-60 mt-8 rounded-md" />
			</section>

			{/* Features Section */}
			<section className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 px-6">
				{Array.from({ length: 3 }).map((_, i) => (
					<Card
						key={i}
						className="flex flex-col items-center text-center p-6 gap-3 border border-muted"
					>
						{/* Icon placeholder */}
						<Skeleton className="h-12 w-12 rounded-full mt-2" />

						{/* Title placeholder */}
						<Skeleton className="h-5 w-32 rounded-md mt-2" />

						{/* Description placeholder */}
						<Skeleton className="h-4 w-48 rounded-md mt-1" />
					</Card>
				))}
			</section>
		</main>
	);
}
