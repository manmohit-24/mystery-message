import { APIResponse } from "@/lib/APIResponse";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/user.model";
import { emailValidation } from "@/schemas/auth.schema";
import { NextRequest } from "next/server";
import { sendEmail, emailConfig } from "@/lib/sendEmail";
import { PasswordResetEmailTemplate } from "@/components/emails/PasswordResetTemplate";
import { generateCode } from "@/lib/generateCode";
import bcrypt from "bcrypt";

const RESPONSES = {
	SUCCESS: (email: string) => ({
		success: true,
		message: `If an account exists with ${email}, you'll receive an email shortly.`,
		status: 200,
	}),

	INVALID_REQUEST: (msg?: string) => ({
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
		const email = req.nextUrl.searchParams.get("email");

		if (!email) return APIResponse(RESPONSES.INVALID_REQUEST());

		const validateResEmail = emailValidation.safeParse(email);
		if (!validateResEmail.success) {
			const zodErrorMsg = JSON.parse(validateResEmail.error.message)[0]
				?.message;
			return APIResponse(RESPONSES.INVALID_REQUEST(zodErrorMsg));
		}

		const user = await User.findOne({ email });

		// We will be sending success even for many invalid cases to prevent brute force attacks and trick hackers.

		if (!user || !user.isActivated)
			return APIResponse(RESPONSES.SUCCESS(email));

		// Token is still valid, don't send new one
		if (user.passwordResetToken && user.passwordResetExpiry > new Date())
			return APIResponse(RESPONSES.SUCCESS(email));

		// If expired, enforce 1-day cooldown
		if (
			user.passwordResetExpiry &&
			Date.now() - user.passwordResetExpiry.getTime() < 24 * 60 * 60 * 1000
		)
			return APIResponse(RESPONSES.SUCCESS(email));

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
				resetUrl: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?userId=${user._id}&token=${passwordResetToken}`,
			}),
        };        
		console.log(
			`${process.env.NEXT_PUBLIC_APP_URL}/reset-password?userId=${user._id}&token=${passwordResetToken}`
		);

		const emailRes = await sendEmail(emailConfig);

		// if (!emailRes.success) return APIResponse(emailRes);

		return APIResponse(RESPONSES.SUCCESS(email));
	} catch (error) {
		console.log("Error requesting forgot password : \n", error);

		return APIResponse(RESPONSES.INTERNAL_ERROR);
	}
}
