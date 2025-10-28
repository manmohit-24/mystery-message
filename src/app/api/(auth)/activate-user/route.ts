import { APIResponse, ApiResType } from "@/lib/APIResponse";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/user.model";
import { NextRequest } from "next/server";
import { activationCodeSchema } from "@/schemas/auth.schema";
import { sendEmail, emailConfig } from "@/lib/sendEmail";
import { WelcomeTemplate } from "@/components/emails/WelcomeTemplate";
import { ReWelcomeTemplate } from "@/components/emails/ReWelcomeTemplate";
import { constants } from "@/lib/constants";

const RESPONSES = {
	SUCCESS: {
		success: true,
		message: "User activated successfully",
		status: 200,
	},
	INVALID_TOKEN: {
		success: false,
		message: "Invalid token",
		status: 400,
	},
	ACCOUNT_NOT_FOUND: {
		success: false,
		message:
			"Account not found, seems like you are either not registered or had been late in activating your account",
		status: 404,
	},
	INTERNAL_ERROR: {
		success: false,
		message: "Some internal error occurred while activating user",
		status: 500,
	},
};

export async function POST(req: NextRequest) {
	try {
		await dbConnect();

		const { userId, code } = await req.json();

		const validateRes = activationCodeSchema.safeParse(code);
		if (!validateRes.success) return APIResponse(RESPONSES.INVALID_TOKEN);

        const user = await User.findById({ _id: userId });
        
		if (!user) return APIResponse(RESPONSES.ACCOUNT_NOT_FOUND);

		if (user.isActivated) return APIResponse(RESPONSES.SUCCESS);

		if (user.activationDeadline < new Date())
			return APIResponse(RESPONSES.ACCOUNT_NOT_FOUND);

		if (user.activationCode !== code)
			return APIResponse(RESPONSES.INVALID_TOKEN);

		/*
        User is validating for reactivation if activation deadline is more than 24 hours wrt to creatd at 
        as first verifiication code is genereatd at created time and at max expires after 1 hr 
        and reactivation deadline is 7 days so it will clearly be more than 1 day of created time.
        We need it for email template selection
        */

		const isReactivation =
			user.activationDeadline.getTime() >
			user.createdAt.getTime() + 24 * 60 * 60 * 1000;

		const updatedUser = await user.updateOne({
			isActivated: true,
			activationCode: "",
			activationDeadline: new Date(),
			isAcceptingMessage: true,
		});

		if (updatedUser.modifiedCount === 0)
			return APIResponse(RESPONSES.INTERNAL_ERROR);

		const { appName } = constants;

		const emailConfig: emailConfig = {
			to: user.email,
			subject: isReactivation
				? `Welcome Back to ${appName}`
				: `Welcome to ${appName}`,
			react: isReactivation
				? ReWelcomeTemplate({ name: user.name, loginLink: "/" })
				: WelcomeTemplate({ name: user.name, dashboardLink: "/" }),
		};

		const emailRes = await sendEmail(emailConfig);

		if (!emailRes.success) return APIResponse(emailRes);

		return APIResponse(RESPONSES.SUCCESS);
	} catch (error) {
		console.log("Error activating user : \n", error);

		return APIResponse(RESPONSES.INTERNAL_ERROR);
	}
}