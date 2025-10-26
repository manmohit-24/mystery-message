import { User } from "@/models/user.model";
import { APIResponse, safeUserResponse } from "@/lib/APIResponse";
import { validateSession } from "@/lib/validateSession";
import { NextRequest } from "next/server";
export async function GET(req: NextRequest) {
	try {
		const sessionValidationRes = await validateSession({ allowGuest: true });

		if (!sessionValidationRes.success) return APIResponse(sessionValidationRes);

		const { user } = sessionValidationRes.data as any;

		let username = req.nextUrl.searchParams.get("username");

		if (username === "me" || username === user.username) {
			return APIResponse({
				success: true,
				message: "User found",
				data: {
					user: safeUserResponse(user),
					isMe: true,
				},
				status: 200,
			});
		}

		const foundUser = await User.findOne({ username });
		if (!foundUser) {
			return APIResponse({
				success: false,
				message: "User not found",
				data: {},
				status: 404,
			});
		}

		return APIResponse({
			success: true,
			message: "User found",
			data: {
				user: {
					id: foundUser._id as string,
					email: foundUser.email,
					username: foundUser.username,
					name: foundUser.name,
				},
				isMe: false,
			},
			status: 200,
		});
	} catch (error) {
		return APIResponse({
			success: false,
			message: "Failed to get user",
			data: {},
			status: 500,
		});
	}
}
