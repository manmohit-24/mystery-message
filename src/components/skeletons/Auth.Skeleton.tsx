import { Skeleton } from "@/components/ui/skeleton";

export default function AuthSkeleton({
	fieldsCount = 0,
	otpLength = 0,
	showBttomLinks = true,
}: {
	fieldsCount?: number;
	otpLength?: number;
	showBttomLinks?: boolean;
}) {
	return (
		<>
			{/* Header */}
			<div className="text-center">
				<Skeleton className="h-10 w-70 mx-auto mb-4" />
				<Skeleton className="h-4 w-80 mx-auto" />
			</div>

			{/* Form fields */}
			{fieldsCount > 0 && (
				<div className="flex flex-col gap-5">
					{Array.from({ length: fieldsCount }).map((_, i) => (
						<div key={i} className="space-y-2">
							<Skeleton className="h-4 w-24" /> {/* Label */}
							<Skeleton className="h-10 w-full rounded-md" /> {/* Input */}
						</div>
					))}
				</div>
			)}

			{/* OTP */}
			{otpLength > 0 && (
				<div className="flex flex-col gap-4 items-center">
					<Skeleton className="h-4 w-40" /> {/* Label */}
					<div className="flex items-center justify-center gap-3">
						{Array.from({ length: otpLength }).map((_, i) => (
							<Skeleton key={i} className="h-12 w-10 rounded-md" />
						))}
					</div>
					<Skeleton className="h-4 w-60" /> {/* Label */}
				</div>
			)}

			{/* Button */}
			<Skeleton className="h-10 w-full rounded-md" />

			{/* Links */}
			{showBttomLinks && (
				<div className="flex items-center justify-center gap-2">
					<Skeleton className="h-4 w-40" />
					<Skeleton className="h-4 w-10" />
				</div>
			)}
		</>
	);
}
