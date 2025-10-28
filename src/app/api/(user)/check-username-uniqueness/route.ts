import { APIResponse } from "@/lib/APIResponse";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/user.model";
import { usernameValidation } from "@/schemas/auth.schema";
import { NextRequest } from "next/server";

const RESPONSES = {
	USERNAME_AVAILABLE: {
		success: true,
		message: "Username is available",
		status: 200,
	},
	USERNAME_NOT_AVAILABLE: {
		success: false,
		message: "Username is not available",
		status: 400,
	},
	INVALID_USERNAME: (msg: string) => ({
		success: false,
		message: msg || "Invalid username format",
		status: 400,
	}),
	INTERNAL_ERROR: {
		success: false,
		message: "Some internal error occurred while checking username",
		status: 500,
	},
};

export async function GET(req: NextRequest) {
	try {
		const username = req.nextUrl.searchParams.get("username");
		const validateRes = usernameValidation.safeParse(username);

		if (!validateRes.success) {
			const zodErrorMsg = JSON.parse(validateRes.error.message)[0].message;
			return APIResponse(RESPONSES.INVALID_USERNAME(zodErrorMsg));
		}

		await dbConnect();

		// check if a User with this username already exists
		const existingUserByUsername = await User.findOne({ username });
		if (
			existingUserByUsername && // username exists
			(existingUserByUsername.isActivated || // is verified
				existingUserByUsername.activationDeadline > new Date()) // or still has time to be verified.
		)
			return APIResponse(RESPONSES.USERNAME_NOT_AVAILABLE);

		return APIResponse(RESPONSES.USERNAME_AVAILABLE);
	} catch (error) {
		console.log("Error checking username : \n", error);

		return APIResponse(RESPONSES.INTERNAL_ERROR);
	}
}
