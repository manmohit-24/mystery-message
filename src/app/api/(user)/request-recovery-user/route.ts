import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/user.model";
import { APIResponse } from "@/lib/APIResponse";
import { NextRequest } from "next/server";
import { sendEmail, emailConfig } from "@/lib/sendEmail";
import { RecoverAccountTemplate } from "@/components/emails/RecoverAccountTemplate";
export async function GET(req: NextRequest) {
	await dbConnect();

	const email = req.nextUrl.searchParams.get("email");

	try {
		const user = await User.findOne({ email });

		if (!user) {
			return APIResponse({
				success: false,
				message: "User not found",
				data: {},
				status: 404,
			});
		}

		if (user.isActivated) {
			return APIResponse({
				success: false,
				message: "User already activated",
				data: {},
				status: 404,
			});
		}

		if (user.activationDeadline < new Date()) {
			return APIResponse({
				success: false,
				message:
					"User activation deadline has passed, Please contact for further assistance.",
				data: {},
				status: 404,
			});
		}

		const emailConfig: emailConfig = {
			to: user.email,
			subject: "Recover Account Instructions",
			react: RecoverAccountTemplate({
				activationCode: user.activationCode,
				deadline: user.activationDeadline,
                name: user.name,
                redirectLink : "/"
			}),
		};

		const emailRes = await sendEmail(emailConfig);

		if (!emailRes.success) return APIResponse(emailRes);

		return APIResponse({
			success: true,
			message: "Email instructions sent successfully",
			data: {},
			status: 200,
		});
	} catch (error) {
		console.log("Failed to Send Email Instructions", error);

		return APIResponse({
			success: false,
			message: "Failed to Send Email Instructions",
			data: {},
			status: 500,
		});
	}
}
