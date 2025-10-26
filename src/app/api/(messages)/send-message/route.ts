import { User } from "@/models/user.model";
import { Message } from "@/models/message.model";
import { NextRequest } from "next/server";
import { APIResponse } from "@/lib/APIResponse";
import { messageReqSchema } from "@/schemas/message.schema";
import { validateSession } from "@/lib/validateSession";
export async function POST(req: NextRequest) {
	try {
		const sessionValidationRes = await validateSession({
			allowGuest: true,
		});

		if (!sessionValidationRes.success) return APIResponse(sessionValidationRes);

		const { user: sender } = sessionValidationRes.data as any;

		const isGuest = sender._id === "guest";

		const body = await req.json();

		const validateRes = messageReqSchema.safeParse(body);

		if (!validateRes.success) {
			const data = JSON.parse(validateRes.error.message)[0];
			return APIResponse({
				success: false,
				message: data.message || "Invalid message format",
				data: data,
				status: 400,
			});
		}

		const { content, receiverId, isAnonymous, isTrulyAnonymous } = body;

		if (!receiverId || receiverId == sender._id) {
			return APIResponse({
				success: false,
				message: "Invalid request",
				data: {},
				status: 400,
			});
		}

		if (!content || content.length < 10 || content.length > 500) {
			return APIResponse({
				success: false,
				message: "Invalid message content",
				data: {},
				status: 400,
			});
		}

		const receiver = await User.findById(receiverId);
		if (!receiver) {
			return APIResponse({
				success: false,
				message: "Receiver not found",
				data: {},
				status: 404,
			});
		}
		if (!receiver.isAcceptingMessage) {
			return APIResponse({
				success: false,
				message: "Receiver is not accepting messages",
				data: {},
				status: 400,
			});
		}

		const message = new Message({
			content,
			sender: isTrulyAnonymous ? null : sender._id,
			receiver: receiver._id,
			isAnonymous: isGuest || isAnonymous || isTrulyAnonymous,
			isTrulyAnonymous: isGuest || isTrulyAnonymous,
			DeletedForSender: isGuest || isTrulyAnonymous,
			DeletedForReceiver: false,
		});

		if (!(await message.save())) {
			return APIResponse({
				success: false,
				message: "Failed to send message",
				data: {},
				status: 500,
			});
		}

		return APIResponse({
			success: true,
			message: "Message sent successfully",
			data: {},
			status: 200,
		});
	} catch (error: any) {
		console.log("Failed to send message", error);

		return APIResponse({
			success: false,
			message: error.message || "Failed to send message",
			data: {},
			status: 500,
		});
	}
}
