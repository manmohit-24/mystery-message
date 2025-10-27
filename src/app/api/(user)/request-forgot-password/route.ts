import { APIResponse } from "@/lib/APIResponse";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/user.model";
import { usernameValidation, emailValidation } from "@/schemas/auth.schema";
import { NextRequest } from "next/server";
import { sendEmail, emailConfig } from "@/lib/sendEmail";
import { PasswordResetEmailTemplate } from "@/components/emails/PasswordResetTemplate";
import { generateCode } from "@/lib/generateCode";
import bcrypt from "bcrypt";
export async function GET(req: NextRequest) {
	await dbConnect();

	try {
		const identifier = req.nextUrl.searchParams.get("identifier");

		if (
			!usernameValidation.safeParse(identifier).success &&
			!emailValidation.safeParse(identifier).success
		) {
			return APIResponse({
				success: false,
				message: "Invalid username or email format",
				status: 400,
				data: {},
			});
		}

		// check if a User with this username already exists
		const user = await User.findOne({
			$or: [{ email: identifier }, { username: identifier }],
		});

		if (!user || !user.isActivated) {
			return APIResponse({
				success: true,
				message:
					"If an account exists with that identifier, you'll receive an email shortly.",
				status: 200,
				data: {},
			});
		}

		// Token is still valid, don't send new one
		if (user.passwordResetToken && user.passwordResetExpiry > new Date()) {
			return APIResponse({
				success: true,
				message:
					"If an account exists with that identifier, you'll receive an email shortly.",
				status: 200,
				data: {},
			});
		}

		// If expired, enforce 1-day cooldown
		if (
			user.passwordResetExpiry &&
			Date.now() - user.passwordResetExpiry.getTime() < 24 * 60 * 60 * 1000
		) {
			return APIResponse({
				success: true,
				message:
					"If an account exists with that identifier, you'll receive an email shortly.",
				status: 200,
				data: {},
			});
		}

		const passwordResetToken = generateCode(32);
		const dbPasswordResetToken = await bcrypt.hash(passwordResetToken, 10);
		const updatedUser = await user.updateOne({
			passwordResetToken: dbPasswordResetToken,
			passwordResetExpiry: new Date(Date.now() + 10 * 60 * 1000),
		});

		if (updatedUser.modifiedCount === 0) {
			return APIResponse({
				success: false,
				message: "Error updating user",
				data: {},
				status: 500,
			});
		}

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

		return APIResponse({
			success: true,
			message:
				"If an account exists with that identifier, you'll receive an email shortly.",
			status: 200,
			data: {},
		});
	} catch (error: any) {
		return APIResponse({
			success: false,
			message: error.message || "Internal Error",
			data: { error },
			status: 500,
		});
	}
}
