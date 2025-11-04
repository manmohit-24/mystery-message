import { Message } from "@/models/message.model";
import { APIResponse } from "@/lib/APIResponse";
import { NextRequest } from "next/server";
import { getMessagesPipeline } from "./pipelines";
import { validateSession } from "@/lib/validateSession";

const RESPONSES = {
	SUCCESS: (data: object) => ({
		success: true,
		message: "Messages fetched successfully",
		status: 200,
		data,
	}),
	INVALID_REQUEST: {
		success: false,
		message: "Invalid request",
		status: 400,
	},
	INTERNAL_ERROR: {
		success: false,
		message: "Some internal error occurred while fetching messages",
		status: 500,
	},
};

export async function GET(req: NextRequest) {
	try {
		const sessionValidationRes = await validateSession({});

		if (!sessionValidationRes.success) return APIResponse(sessionValidationRes);

		const { user } = sessionValidationRes.data as any;

		const role = req.nextUrl.searchParams.get("role");

		if (!role || (role !== "receiver" && role !== "sender"))
			return APIResponse(RESPONSES.INVALID_REQUEST);

		const limit = 10;
		const cursor = req.nextUrl.searchParams.get("cursor");

		const pipeline = getMessagesPipeline({
			role,
			userId: user._id as string,
			cursor,
			limit: limit + 1, // fetching one extra to see if there’s more
		});

		const messages = await Message.aggregate(pipeline);

		const messagesIds = messages.map((msg) => msg._id);
		markMessagesRead(messagesIds).catch((err) =>
			console.error("Background markMessagesRead failed:", err)
		);

		let nextCursor = null;
		if (messages.length > limit) {
			messages.pop(); // removing that extra msg
			nextCursor = messages[messages.length - 1]._id;
		}

		return APIResponse(RESPONSES.SUCCESS({ messages, nextCursor }));
	} catch (error: any) {
		console.log("Erorr fetching user's messages: h", error);
		return APIResponse(RESPONSES.INTERNAL_ERROR);
	}
}

const markMessagesRead = async (messageIds: string[]) => {
	try {
		await Message.updateMany(
			{
				_id: { $in: messageIds },
			},
			{ $set: { status: "read" } }
		);
	} catch (error: any) {
		console.log("Error updating message read status: \n", error);
	}
};
