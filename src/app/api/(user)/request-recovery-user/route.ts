import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/user.model";
import { APIResponse } from "@/lib/APIResponse";
import { NextRequest } from "next/server";
import { sendEmail, emailConfig } from "@/lib/sendEmail";
import { RecoverAccountTemplate } from "@/components/emails/RecoverAccountTemplate";
import { emailValidation } from "@/schemas/auth.schema";

const RESPONSES = {
	SUCCESS: {
		success: true,
		message:
			"If an account exists with that identifier, you'll receive an email shortly.",
		status: 200,
	},
	INVALID_REQUEST: (msg?: string) => ({
		success: false,
		message: msg || "Invalid request",
		status: 400,
	}),
	INTERNAL_ERROR: {
		success: false,
		message: "Some internal error occurred while requesting recovery user",
		status: 500,
	},
};

export async function GET(req: NextRequest) {
	try {
		await dbConnect();

		const email = req.nextUrl.searchParams.get("email");

		const validateRes = emailValidation.safeParse(email);

		if (!validateRes.success) {
			const zodErrorMsg = JSON.parse(validateRes.error.message)[0].message;
			return APIResponse(RESPONSES.INVALID_REQUEST(zodErrorMsg));
		}

		const user = await User.findOne({ email });

		if (!user) return APIResponse(RESPONSES.SUCCESS);

		if (user.isActivated) return APIResponse(RESPONSES.INVALID_REQUEST());

		if (user.activationDeadline < new Date())
			return APIResponse(
				RESPONSES.INVALID_REQUEST("Your Account was prematurely deleted.")
			);

		const emailConfig: emailConfig = {
			to: user.email,
			subject: "Recover Account Instructions",
			react: RecoverAccountTemplate({
				activationCode: user.activationCode,
				deadline: user.activationDeadline,
				name: user.name,
				redirectLink: `${process.env.PUBLIC_APP_URL}/activate-account?userId=${user._id}`,
			}),
		};

		const emailRes = await sendEmail(emailConfig);

		if (!emailRes.success) return APIResponse(emailRes);

		return APIResponse(RESPONSES.SUCCESS);
	} catch (error) {
		console.log("Error requesting recovery user : \n", error);

		return APIResponse(RESPONSES.INTERNAL_ERROR);
	}
}
