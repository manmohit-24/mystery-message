import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/(auth)/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/user.model";
import { ApiResType } from "./APIResponse";
export async function validateSession({
	allowGuest = false,
	allowNonActivated = false,
}: {
	allowGuest?: boolean;
	allowNonActivated?: boolean;
}): Promise<ApiResType> {
	const session = await getServerSession(authOptions);
	if (!session || !session.user) {
		return {
			success: false,
			message: "Not Authenticated",
			data: {},
			status: 401,
		};
	}

	const userId = session.user._id;

	if (userId === "guest") {
		if (allowGuest) {
			return {
				success: true,
				message: "Guest session is valid",
				data: { user: { _id: "guest" } },
				status: 200,
			};
		}
		return {
			success: false,
			message: "Guests can't perform this action",
			data: {},
			status: 401,
		};
	}
	try {
		await dbConnect();

		const user = await User.findById(userId);
		if (!user) {
			return {
				success: false,
				message: "User not found",
				data: { shouldLogOut: true },
				status: 404,
			};
		}
		if (!allowNonActivated && !user.isActivated) {
			return {
				success: false,
				message: "User is not activated",
				data: { shouldLogOut: true },
				status: 401,
			};
		}
		return {
			success: true,
			message: "Session is valid",
			data: { user },
			status: 200,
		};
	} catch (error) {
		return {
			success: false,
			message: "Error validating session",
			data: { error },
			status: 500,
		};
	}
}
