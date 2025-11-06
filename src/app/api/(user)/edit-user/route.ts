import { APIResponse } from "@/lib/APIResponse";
import { validateSession } from "@/lib/validateSession";
import { editProfileSchema } from "@/schemas/auth.schema";
import { NextRequest } from "next/server";

const RESPONSES = {
	SUCCESS: {
		success: true,
		message: "Profile Updated Successfully",
		status: 200,
    },
    INVALID_REQUEST: (msg: string) => ({
        success: false,
        message: msg || "Invalid request",
        status: 400,
    }),
	INTERNAL_ERROR: {
		success: false,
		message: "Some internal error occurred while updating profile",
		status: 500,
	},
};

export async function PATCH(req: NextRequest) {
	try {
		const sessionValidationRes = await validateSession({});

		if (!sessionValidationRes.success) return APIResponse(sessionValidationRes);

		const { user } = sessionValidationRes.data as any;
        const body = await req.json();

        const validateRes = editProfileSchema.safeParse(body);

        if (!validateRes.success) {
            const zodErrorMsg = JSON.parse(validateRes.error.message)[0].message;
            return APIResponse(RESPONSES.INVALID_REQUEST(zodErrorMsg));
        }

        const updatedUser = await user.updateOne({
            username: body.username,
            name: body.name,
        });

		if (updatedUser.modifiedCount === 0)
			return APIResponse(RESPONSES.INTERNAL_ERROR);

		return APIResponse(RESPONSES.SUCCESS);
	} catch (error) {
		console.log("Error deleting user : \n", error);
		return APIResponse(RESPONSES.INTERNAL_ERROR);
	}
}
