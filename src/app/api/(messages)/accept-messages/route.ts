import { NextRequest } from "next/server";
import { APIResponse } from "@/lib/APIResponse";
import { validateSession } from "@/lib/validateSession";

export async function POST(req: NextRequest) {
	try {
		const sessionValidationRes = await validateSession({});

		if (!sessionValidationRes.success) return APIResponse(sessionValidationRes);

		const { user } = sessionValidationRes.data as any;

		const { acceptMessages } = await req.json();

		const updatedUser = await user.updateOne({
			isAcceptingMessage: acceptMessages,
		});

		if (!updatedUser) {
			return APIResponse({
				success: false,
				message: "Failed to update user messages acceptance status",
				data: {},
				status: 500,
			});
		}

		return APIResponse({
			success: true,
			message: "Message acceptance status updated successfully",
			data: { isAcceptingMessage: updatedUser.isAcceptingMessage },
			status: 200,
		});
	} catch (error) {
		console.log("Error updating user messages acceptance status \n" , error);

		return APIResponse({
			success: false,
			message: "Some internal error occured while registering user",
			data: {},
			status: 500,
		});
	}
}

export async function GET() {
	try {
		const sessionValidationRes = await validateSession({});

		if (!sessionValidationRes.success) return APIResponse(sessionValidationRes);

		const { user } = sessionValidationRes.data as any;

		return APIResponse({
			success: true,
			message: `User is${!user.isAcceptingMessage ? " not" : ""} accepting messages:`,
			data: { isAcceptingMessage: user.isAcceptingMessage },
			status: 200,
		});
	} catch (error) {
		console.log("Failed to fetch user's status to accept messages \n" , error);

		return APIResponse({
			success: false,
			message: "Failed to fetch user's status to accept messages",
			data: {},
			status: 500,
		});
	}
}
