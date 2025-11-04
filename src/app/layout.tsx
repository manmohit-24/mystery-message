import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/context/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import { constants } from "@/lib/constants";
import AppLoader from "@/components/AppLoader";

export const metadata: Metadata = {
	title: constants.appName,
	description: constants.description,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="scroll-smooth bg-background">
			<body>
				<AuthProvider>
					<AppLoader>
						<Navbar />
						<main className="mt-16" >{children}</main>
					</AppLoader>
					<Toaster />
				</AuthProvider>
			</body>
		</html>
	);
}
