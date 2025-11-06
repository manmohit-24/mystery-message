import { z } from "zod";

export const acceptMessageSchema = z.object({
    isAcceptingMessage: z.boolean(),
});

export const messageReqSchema = z.object({
	content: z
		.string()
		.min(10, "Message must be at least 10 characters long.")
		.max(500, "Message cannot exceed 500 characters."),
	receiverId: z.string().min(1, "Receiver ID is required."),
	isAnonymous: z.boolean().catch(false),
	isTrulyAnonymous: z.boolean().catch(false),
});

export const messageResSchema = z.object({
	_id: z.string(),
	content: z.string(),
	sender: z.object({
		name: z.string(),
		username: z.string(),
		_id: z.string(),
	}),
	receiver: z.object({
		name: z.string(),
		username: z.string(),
		_id: z.string(),
	}),
	isAnonymous: z.boolean(),
	status: z
		.string()
		.refine(
			(status) => ["failed", "sent", "read"].includes(status),
			"Invalid status."
		),
	createdAt: z.string(),
});

export type MessageReqType = z.infer<typeof messageReqSchema>;
export type MessageResType = z.infer<typeof messageResSchema>;
