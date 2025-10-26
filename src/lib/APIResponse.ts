import { NextResponse } from "next/server";
import { resDataSchema } from "@/schemas/apiResData.schema";
import { User as UserDoc } from "@/models/user.model";

export interface ApiResType {
	status: number;
	success: boolean;
	message: string;
	data: object;
}
type safeUserResObj = {
	id: string;
	email: string;
	username: string;
	name: string;
	isActivated: boolean;
	isAcceptingMessage: boolean;
};

export const APIResponse = (response: ApiResType): NextResponse => {
	let safeData: unknown;
	// validating data against Zod schema
	const result = resDataSchema.safeParse(response.data);

	if (result.success) {
		safeData = result.data;
	} else {
		console.error("Invalid API response data:", result.error.format());
		safeData = {
			error:
				"Invalid , unsafe or sensitive API response data was tried to send back",
		};
	}

	return NextResponse.json(
		{
			...response,
			data: safeData,
		},
		{ status: response.status }
	);
};

export function safeUserResponse(user: UserDoc): safeUserResObj {
	return {
		id: user._id as string,
		email: user.email,
		username: user.username,
		name: user.name,
		isActivated: user.isActivated,
		isAcceptingMessage: user.isAcceptingMessage,
	};
}
