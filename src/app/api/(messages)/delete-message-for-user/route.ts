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

		if (!msgRes) {
			return APIResponse({
				success: false,
				message: "Error deleting message",
				data: {},
				status: 500,
			});
		}

		return APIResponse({
			success: true,
			message: "Message dleted successfully",
			data: {},
			status: 200,
		});
	} catch (error: any) {
		console.log("Error deleting message :", error.message);
		return APIResponse({
			success: false,
			message: "Error deleting message",
			data: {},
			status: 500,
		});
	}
}
