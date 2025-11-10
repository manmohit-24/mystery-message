import { User } from "@/models/user.model";
import { APIResponse, safeUserResponse } from "@/lib/APIResponse";
import { validateSession } from "@/lib/validateSession";
import { NextRequest } from "next/server";

const RESPONSES = {
	SUCCESS: (data: object) => ({
		success: true,
		message: "User found",
		status: 200,
		data,
	}),
	INTERNAL_ERROR: {
		success: false,
		message: "Some internal error occurred while getting user",
		status: 500,
	},
};

export async function GET(req: NextRequest) {
	try {
        const sessionValidationRes = await validateSession({ allowGuest: true });
        
		if (!sessionValidationRes.success) return APIResponse(sessionValidationRes);

		const { user } = sessionValidationRes.data as any;

		let userId = req.nextUrl.searchParams.get("userId");

		if (!userId) return APIResponse(RESPONSES.INTERNAL_ERROR);

		if (userId === "me")
			return APIResponse(
				RESPONSES.SUCCESS({
					user: safeUserResponse(user),
					isMe: true,
				})
			);

		const foundUser = await User.findOne({ "_id" :  userId});
		if (!foundUser) return APIResponse(RESPONSES.INTERNAL_ERROR);

		return APIResponse(
			RESPONSES.SUCCESS({
				user: safeUserResponse(foundUser),
				isMe: false,
			})
		);
	} catch (error) {
		console.log("Error getting user : \n", error);
		return APIResponse(RESPONSES.INTERNAL_ERROR);
	}
}
