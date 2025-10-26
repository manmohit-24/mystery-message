import { z } from "zod";

export const messageReqSchema = z.object({
	content: z
		.string()
		.min(10, "Message must be at least 10 characters long.")
		.max(500, "Message cannot exceed 500 characters."),
    receiverId: z.string().min(1, "Receiver ID is required."),
	isAnonymous: z.boolean().default(false),
	isTrulyAnonymous: z.boolean().default(false),
});
