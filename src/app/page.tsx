"use client";
import React, { useEffect, useState } from "react";
import { useUserStore } from "@/store/user.store";
import { Progress } from "@/components/ui/progress";
function page() {
	const { isLoadingUser } = useUserStore();
	const [progress, setProgress] = useState(0);
	useEffect(() => {
		if (!isLoadingUser && progress < 100) setProgress(100);

		if (isLoadingUser && progress < 90) {
			const timer = setTimeout(() => setProgress((prev) => prev + 5), 50);
			return () => clearTimeout(timer);
		}
	}, [progress, isLoadingUser]);
	return (
		<div className="flex flex-col items-center justify-center h-[80vh] gap-6 text-center">
			<div className="space-y-2 w-48">
				<Progress value={progress} />
			</div>
			<p className="text-md "> Please Wait ...</p>
		</div>
	);
}

export default page;
