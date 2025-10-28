import { User } from "@/models/user.model";
import { APIResponse, safeUserResponse } from "@/lib/APIResponse";
import { validateSession } from "@/lib/validateSession";
import { NextRequest } from "next/server";
import { usernameValidation } from "@/schemas/auth.schema";

const RESPONSES = {
	SUCCESS: (data: object) => ({
		success: true,
		message: "User found",
		status: 200,
		data,
	}),
	INVALID_USERNAME: (msg: string) => ({
		success: false,
		message: msg || "Invalid username format",
		status: 400,
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

		let username = req.nextUrl.searchParams.get("username");

		if (username === "me" || username === user.username)
			return APIResponse(
				RESPONSES.SUCCESS({
					user: safeUserResponse(user),
					isMe: true,
				})
			);

		const validateRes = usernameValidation.safeParse(username);

		if (!validateRes.success) {
			const zodErrorMsg = JSON.parse(validateRes.error.message)[0].message;
			return APIResponse(RESPONSES.INVALID_USERNAME(zodErrorMsg));
		}

		const foundUser = await User.findOne({ username });
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
