import { NextRequest } from "next/server";
import { APIResponse } from "@/lib/APIResponse";
import { validateSession } from "@/lib/validateSession";

const RESPONSES = {
	SUCCESS: (isAcceptingMessage: string) => ({
		success: true,
		message: `User is${!isAcceptingMessage ? " not" : ""} accepting messages:`,
		data: { isAcceptingMessage },
		status: 200,
	}),
	INTERNAL_ERROR: {
		success: false,
		message: "Some internal error occured.",
		status: 500,
	},
};

export async function POST(req: NextRequest) {
	try {
		const sessionValidationRes = await validateSession({});

		if (!sessionValidationRes.success) return APIResponse(sessionValidationRes);

		const { user } = sessionValidationRes.data as any;

		const { acceptMessages } = await req.json();

		const updatedUser = await user.updateOne({
			isAcceptingMessage: acceptMessages,
		});

		if (updatedUser.modifiedCount === 0)
			return APIResponse(RESPONSES.INTERNAL_ERROR);

		return APIResponse(RESPONSES.SUCCESS(acceptMessages));
	} catch (error) {
		console.log("Error updating user messages acceptance status : \n", error);
		return APIResponse(RESPONSES.INTERNAL_ERROR);
	}
}

export async function GET() {
	try {
		const sessionValidationRes = await validateSession({});

		if (!sessionValidationRes.success) return APIResponse(sessionValidationRes);

		const { user } = sessionValidationRes.data as any;

		return APIResponse(RESPONSES.SUCCESS(user.isAcceptingMessage));
	} catch (error) {
		console.log("Error fetching user's status to accept messages : \n", error);
		return APIResponse(RESPONSES.INTERNAL_ERROR);
	}
}
