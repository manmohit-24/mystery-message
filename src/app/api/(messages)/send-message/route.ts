import { User } from "@/models/user.model";
import { Message } from "@/models/message.model";
import { NextRequest } from "next/server";
import { APIResponse } from "@/lib/APIResponse";
import { messageReqSchema } from "@/schemas/message.schema";
import { validateSession } from "@/lib/validateSession";

const RESPONSES = {
	SUCCESS: {
		success: true,
		message: "Message sent successfully",
		status: 200,
	},
	INVALID_REQUEST: (msg: string) => ({
		success: false,
		message: msg || "Invalid request",
		status: 400,
	}),
	RECEIVER_NOT_FOUND: {
		success: false,
		message: "Receiver not found",
		status: 404,
	},
	RECEIVER_NOT_ACCEPTING_MESSAGE: {
		success: false,
		message: "Receiver not accepting messages",
		status: 403,
	},
	INTERNAL_ERROR: {
		success: false,
		message: "Some internal error occurred while sending message",
		status: 500,
	},
};
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

		const { content, receiverId, isAnonymous, isTrulyAnonymous } = body;

		if (!validateRes.success || receiverId == sender._id) {
			const validationErrorMsg = validateRes.error
				? JSON.parse(validateRes?.error.message)[0].message
				: "";
			return APIResponse(RESPONSES.INVALID_REQUEST(validationErrorMsg));
		}

		const receiver = await User.findById(receiverId);
		if (!receiver) return APIResponse(RESPONSES.RECEIVER_NOT_FOUND);
        
		if (!receiver.isAcceptingMessage)
			return APIResponse(RESPONSES.RECEIVER_NOT_ACCEPTING_MESSAGE);
        console.log("here");
        
		const message = new Message({
			content,
			sender: isGuest || isTrulyAnonymous ? null : sender._id,
			receiver: receiver._id,
			isAnonymous: isGuest || isAnonymous || isTrulyAnonymous,
			isTrulyAnonymous: isGuest || isTrulyAnonymous,
			DeletedForSender: isGuest || isTrulyAnonymous,
			DeletedForReceiver: false,
			status: "sent",
		});

		if (!(await message.save())) return APIResponse(RESPONSES.INTERNAL_ERROR);

		return APIResponse(RESPONSES.SUCCESS);
	} catch (error: any) {
		console.log("Error sending message : \n", error);

		return APIResponse(RESPONSES.INTERNAL_ERROR);
	}
}
