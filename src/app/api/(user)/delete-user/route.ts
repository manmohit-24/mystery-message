import { APIResponse } from "@/lib/APIResponse";
import { generateCode } from "@/lib/generateCode";
import { AccountDeleteAlertTemplate } from "@/components/emails/AccountDeleteAlertTemplate";
import { sendEmail, emailConfig } from "@/lib/sendEmail";
import { validateSession } from "@/lib/validateSession";

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

		if (!updatedUser) {
			return APIResponse({
				success: false,
				message: "Error deleting user",
				data: {},
				status: 500,
			});
		}

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

		return APIResponse({
			success: true,
			message: `Account is scheduled for deletion at ${activationDeadline.toDateString()}`,
			data: {},
			status: 200,
		});
	} catch (error) {
		return APIResponse({
			success: false,
			message: "Error deleting user",
			data: {},
			status: 500,
		});
	}
}
