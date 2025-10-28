import { APIResponse } from "@/lib/APIResponse";
import { generateCode } from "@/lib/generateCode";
import { AccountDeleteAlertTemplate } from "@/components/emails/AccountDeleteAlertTemplate";
import { sendEmail, emailConfig } from "@/lib/sendEmail";
import { validateSession } from "@/lib/validateSession";

const RESPONSES = {
	SUCCESS: (activationDeadline: Date) => ({
		success: true,
		message: `Account is scheduled for deletion at ${activationDeadline.toDateString()}`,
		status: 200,
	}),
	INTERNAL_ERROR: {
		success: false,
		message: "Some internal error occurred while deleting user",
		status: 500,
	},
};

export async function DELETE() {
	try {
		const sessionValidationRes = await validateSession({});

		if (!sessionValidationRes.success) return APIResponse(sessionValidationRes);

		const { user } = sessionValidationRes.data as any;

		const activationCode = generateCode(6);
		const activationDeadline = new Date();
		activationDeadline.setDate(activationDeadline.getDate() + 8);
		activationDeadline.setHours(0, 0, 0, 0);

		const updatedUser = await user.updateOne({
			isActivated: false,
			activationCode,
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

		const emailRes = await sendEmail(emailConfig);

		if (!emailRes.success) return APIResponse(emailRes);

		return APIResponse(RESPONSES.SUCCESS(activationDeadline));
	} catch (error) {
		console.log("Error deleting user : \n", error);
		return APIResponse(RESPONSES.INTERNAL_ERROR);
	}
}
