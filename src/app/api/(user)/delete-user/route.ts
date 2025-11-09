import { APIResponse } from "@/lib/APIResponse";
import { AccountDeleteAlertTemplate } from "@/components/emails/AccountDeleteAlertTemplate";
import { sendEmail, emailConfig } from "@/lib/sendEmail";
import { validateSession } from "@/lib/validateSession";
import { NextRequest } from "next/server";
import bcrypt from "bcrypt";
import { passwordValidation } from "@/schemas/auth.schema";

const RESPONSES = {
	SUCCESS: (activationDeadline: Date) => ({
		success: true,
		message: `Account is scheduled for deletion at ${activationDeadline.toDateString()}`,
		status: 200,
	}),
	INVALID_REQUEST: (message: string) => ({
		success: false,
		message: message || "Invalid request",
		status: 400,
	}),
	INTERNAL_ERROR: {
		success: false,
		message: "Some internal error occurred while deleting user",
		status: 500,
	},
};

export async function PATCH(req: NextRequest) {
	try {
		const sessionValidationRes = await validateSession({});

		if (!sessionValidationRes.success) return APIResponse(sessionValidationRes);

		const { user } = sessionValidationRes.data as any;

		const { password } = await req.json();

		const validateRes = passwordValidation.safeParse(password);

		if (!validateRes.success) {
			const zodErrorMsg = JSON.parse(validateRes.error.message)[0].message;
			return APIResponse(RESPONSES.INVALID_REQUEST(zodErrorMsg));
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid)
			return APIResponse(RESPONSES.INVALID_REQUEST("Invalid password"));

		const activationDeadline = new Date();
		activationDeadline.setDate(activationDeadline.getDate() + 8);
		activationDeadline.setHours(0, 0, 0, 0);

		const updatedUser = await user.updateOne({
			isActivated: false,
			activationDeadline,
			isAcceptingMessage: false,
		});

		if (updatedUser.modifiedCount === 0)
			return APIResponse(RESPONSES.INTERNAL_ERROR);

		const emailConfig: emailConfig = {
			to: user.email,
			subject: "Account Deletion Alert",
			react: AccountDeleteAlertTemplate({
				name: user.name,
				deletionDate: activationDeadline,
			}),
		};

		await sendEmail(emailConfig);

		return APIResponse(RESPONSES.SUCCESS(activationDeadline));
	} catch (error) {
		console.log("Error deleting user : \n", error);
		return APIResponse(RESPONSES.INTERNAL_ERROR);
	}
}
