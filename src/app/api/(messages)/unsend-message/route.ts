import { Message } from "@/models/message.model";
import { APIResponse } from "@/lib/APIResponse";
import { NextRequest } from "next/server";
import { validateSession } from "@/lib/validateSession";

const RESPONSES = {
	SUCCESS: {
		success: true,
		message: "Message unsend successfully",
		status: 200,
	},
	NOT_AUTHORIZED: {
		success: false,
		message: "You are not authorized to unsend this message",
		status: 403,
	},
	MESSAGE_NOT_FOUND: {
		success: false,
		message: "Message not found",
		status: 404,
	},
	INTERNAL_ERROR: {
		success: false,
		message: "Some internal error occurred while unsend message",
		status: 500,
	},
};

export async function DELETE(req: NextRequest) {
	try {
		const sessionValidationRes = await validateSession({});

		if (!sessionValidationRes.success) return APIResponse(sessionValidationRes);

		const { user } = sessionValidationRes.data as any;

        const messageId = req.nextUrl.searchParams.get("messageId");

		const message = await Message.findById(messageId);

		if (!message) return APIResponse(RESPONSES.MESSAGE_NOT_FOUND);

		if (!message.sender || message.sender.toString() !== user._id.toString())
			return APIResponse(RESPONSES.NOT_AUTHORIZED);

		const deletedMessage = await message.deleteOne();

		if (!deletedMessage) return APIResponse(RESPONSES.INTERNAL_ERROR);

		return APIResponse(RESPONSES.SUCCESS);
	} catch (error) {
		console.log("Error unsending message : \n", error);
		return APIResponse(RESPONSES.INTERNAL_ERROR);
	}
}
