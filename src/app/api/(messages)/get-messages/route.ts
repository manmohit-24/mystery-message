import { User } from "@/models/user.model";
import { Message } from "@/models/message.model";
import { APIResponse } from "@/lib/APIResponse";
import { NextRequest } from "next/server";
import { getMessagesPipeline } from "./pipelines";
import { validateSession } from "@/lib/validateSession";

export async function GET(req: NextRequest) {
	try {
		const sessionValidationRes = await validateSession({});

		if (!sessionValidationRes.success) return APIResponse(sessionValidationRes);

		const { user } = sessionValidationRes.data as any;
        
        const role = req.nextUrl.searchParams.get("role");
        
		if (!role || (role !== "receiver" && role !== "sender")) {
			return APIResponse({
				success: false,
				message: "Invalid request",
				data: {},
				status: 400,
			});
		}

		const limit = 10;
		const cursor = req.nextUrl.searchParams.get("cursor");

		const pipeline = getMessagesPipeline({
			role,
			userId: user._id as string,
			cursor,
			limit: limit + 1, // fetching one extra to see if there’s more
		});

		const messages = await Message.aggregate(pipeline);

		let nextCursor = null;
		if (messages.length > limit) {
			messages.pop(); // removing that extra msg
			nextCursor = messages[messages.length - 1]._id;
		}

		return APIResponse({
			success: true,
			message: "User's messages fetched successfully",
			data: {
				messages,
				nextCursor,
			},
			status: 200,
		});
	} catch (error: any) {
		console.log("Failed to fetch user's messages :", error);

		return APIResponse({
			success: false,
			message: error.message || "Failed to fetch user's messages",
			data: {},
			status: 500,
		});
	}
}
