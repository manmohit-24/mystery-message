import { Message } from "@/models/message.model";
import { APIResponse } from "@/lib/APIResponse";
import { NextRequest } from "next/server";
import { validateSession } from "@/lib/validateSession";
export async function DELETE(req: NextRequest) {
	try {
		const sessionValidationRes = await validateSession({});

		if (!sessionValidationRes.success) return APIResponse(sessionValidationRes);

		const { user } = sessionValidationRes.data as any;

		const { messageId } = await req.json();

		const message = await Message.findById(messageId);
		if (!message) {
			return APIResponse({
				success: false,
				message: "Message not found",
				data: {},
				status: 404,
			});
		}

		if (!message.sender || message.sender.toString() !== user._id.toString()) {
			return APIResponse({
				success: false,
				message: "You are not authorized to unsend this message",
				data: {},
				status: 403,
			});
		}

		const deletedMessage = await message.deleteOne();

		if (!deletedMessage) {
			return APIResponse({
				success: false,
				message: "Error deleting message",
				data: {},
				status: 500,
			});
		}

		return APIResponse({
			success: true,
			message: "Message unsend successfully",
			data: {},
			status: 200,
		});
	} catch (error) {
		return APIResponse({
			success: false,
			message: "Error deleting message",
			data: {},
			status: 500,
		});
	}
}
