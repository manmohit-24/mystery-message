import { Message } from "@/models/message.model";
import { APIResponse } from "@/lib/APIResponse";
import { NextRequest } from "next/server";
import { validateSession } from "@/lib/validateSession";

const RESPONSES = {
	SUCCESS: {
		success: true,
		message: "Message deleted successfully",
		status: 200,
	},
	MESSAGE_NOT_FOUND: {
		success: false,
		message: "Message not found",
		status: 404,
	},
	INTERNAL_ERROR: {
		success: false,
		message: "Some internal error occurred while deleting message",
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

		let msgRes = null;

		if (message.receiver.toString() === user._id.toString()) {
			if (message.DeletedForSender) msgRes = await message.deleteOne();
			else
				msgRes = await message.updateOne({
					DeletedForReceiver: true,
				});
		} else if (
			message.sender &&
			message.sender.toString() == user._id.toString()
		) {
			if (message.DeletedForReceiver) msgRes = await message.deleteOne();
			else
				msgRes = await message.updateOne({
					DeletedForSender: true,
				});
		}

		if (!msgRes || msgRes?.modifiedCount === 0) 
			return APIResponse(RESPONSES.INTERNAL_ERROR);
		
		return APIResponse(RESPONSES.SUCCESS);
	} catch (error) {
		console.log("Error deleting message : \n", error);
		return APIResponse(RESPONSES.INTERNAL_ERROR);
	}
}
