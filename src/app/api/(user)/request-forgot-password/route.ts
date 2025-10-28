import { APIResponse } from "@/lib/APIResponse";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/user.model";
import { usernameValidation, emailValidation } from "@/schemas/auth.schema";
import { NextRequest } from "next/server";
import { sendEmail, emailConfig } from "@/lib/sendEmail";
import { PasswordResetEmailTemplate } from "@/components/emails/PasswordResetTemplate";
import { generateCode } from "@/lib/generateCode";
import bcrypt from "bcrypt";

const RESPONSES = {
	SUCCESS: {
		success: true,
		message:
			"If an account exists with that identifier, you'll receive an email shortly.",
		status: 200,
	},
	INVALID_REQUEST: (msg: string) => ({
		success: false,
		message: msg || "Invalid request",
		status: 400,
	}),

	INTERNAL_ERROR: {
		success: false,
		message: "Some internal error occurred while requesting password reset",
		status: 500,
	},
};
export async function GET(req: NextRequest) {
	await dbConnect();

	try {
		const identifier = req.nextUrl.searchParams.get("identifier");

		const validateResUsername = usernameValidation.safeParse(identifier);
		const validateResEmail = emailValidation.safeParse(identifier);
		if (
			!identifier ||
			!validateResUsername.success ||
			!validateResEmail.success
		) {
			const zodErrorMsg = JSON.parse(
				(!validateResUsername.success && validateResUsername?.error.message) ||
					(!validateResEmail.success && validateResEmail.error.message) ||
					"{}"
			)[0]?.message;
			return APIResponse(RESPONSES.INVALID_REQUEST(zodErrorMsg));
		}

		// check if a User with this username already exists
		const user = await User.findOne({
			$or: [{ email: identifier }, { username: identifier }],
		});

		// We will be sending success even for many invalid cases to prevent brute force attacks and trick hackers.

		if (!user || !user.isActivated) return APIResponse(RESPONSES.SUCCESS);

		// Token is still valid, don't send new one
		if (user.passwordResetToken && user.passwordResetExpiry > new Date())
			return APIResponse(RESPONSES.SUCCESS);

		// If expired, enforce 1-day cooldown
		if (
			user.passwordResetExpiry &&
			Date.now() - user.passwordResetExpiry.getTime() < 24 * 60 * 60 * 1000
		)
			return APIResponse(RESPONSES.SUCCESS);

		const passwordResetToken = generateCode(32);
		const dbPasswordResetToken = await bcrypt.hash(passwordResetToken, 10);
		const updatedUser = await user.updateOne({
			passwordResetToken: dbPasswordResetToken,
			passwordResetExpiry: new Date(Date.now() + 10 * 60 * 1000),
		});

		if (updatedUser.modifiedCount === 0)
			return APIResponse(RESPONSES.INTERNAL_ERROR);

		const emailConfig: emailConfig = {
			to: user.email,
			subject: "Password Reset",
			react: PasswordResetEmailTemplate({
				name: user.username,
				resetUrl: `${process.env.PUBLIC_APP_URL}/reset-password?userId=${user._id}&token=${passwordResetToken}`,
			}),
		};

		const emailRes = await sendEmail(emailConfig);

		if (!emailRes.success) return APIResponse(emailRes);

		return APIResponse(RESPONSES.SUCCESS);
    } catch (error) {
        console.log("Error requesting forgot password : \n" , error);
        
		return APIResponse(RESPONSES.INTERNAL_ERROR);
	}
}
