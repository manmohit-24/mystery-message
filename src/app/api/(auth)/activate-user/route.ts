import { APIResponse, safeUserResponse } from "@/lib/APIResponse";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/user.model";
import { NextRequest } from "next/server";
import { activationCodeSchema } from "@/schemas/auth.schema";
import { sendEmail, emailConfig } from "@/lib/sendEmail";
import { WelcomeTemplate } from "@/components/emails/WelcomeTemplate";
import { ReWelcomeTemplate } from "@/components/emails/ReWelcomeTemplate";
import { constants } from "@/lib/constants";

export async function POST(req: NextRequest) {
	await dbConnect();

	try {
		const { userId, code } = await req.json();

		const validateRes = activationCodeSchema.safeParse(code);
		if (!validateRes.success) {
			const data = JSON.parse(validateRes.error.message)[0];
			return APIResponse({
				success: false,
				message: data.message || "Invalid token format",
				data: data,
				status: 400,
			});
		}
		const user = await User.findById({ _id: userId });
		if (!user) {
			return APIResponse({
				success: false,
				message:
					"Account not found , seems like you are either not registered or had been late in activating your account",
				data: {},
				status: 404,
			});
		}

		if (user.isActivated) {
			return APIResponse({
				success: false,
				message: "User already activated",
				data: {},
				status: 400,
			});
		}

		if (user.activationDeadline < new Date()) {
			return APIResponse({
				success: false,
				message: "Activation deadline had passed",
				data: {},
				status: 400,
			});
		}

		if (user.activationCode !== code) {
			return APIResponse({
				success: false,
				message: "Incorrect activation token",
				data: safeUserResponse(user),
				status: 400,
			});
		}

		/*
        User is validating for reactivation if activation deadline is more than 24 hours wrt to creatd at 
        as first verifiication code is genereatd at created time and at max expires after 1 hr 
        and reactivation deadline is 7 days so it will clearly be more than 1 day of created time 
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

		if (!updatedUser) {
			return APIResponse({
				success: false,
				message: "Error activating user",
				data: {},
				status: 500,
			});
		}

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

		return APIResponse({
			success: true,
			message: "User activated successfully",
			data: {},
			status: 200,
		});
	} catch (error) {
		console.log("Error activating user", error);

		return APIResponse({
			success: false,
			message: "Some internal error occured while activating user",
			data: { error },
			status: 500,
		});
	}
}
