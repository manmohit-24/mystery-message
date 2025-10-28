import { Resend } from "resend";
import { ApiResType } from "./APIResponse";

const resend = new Resend(process.env.RESEND_API_KEY);
export interface emailConfig {
	to: string;
	subject: string;
	react: React.ReactNode;
}

const RESPONSES = {
	SUCCESS: {
		success: true,
		message: "Email sent successfully",
		status: 200,
	},
	INTERNAL_ERROR: {
		success: false,
		message: "Error sending email",
		status: 500,
	},
};

export async function sendEmail(emailConfig: emailConfig): Promise<ApiResType> {
	try {
		const from = "Mystery Message <manmohit@resend.dev>";

		const { error } = await resend.emails.send({ from, ...emailConfig });

		if (error) return RESPONSES.INTERNAL_ERROR;

		return RESPONSES.SUCCESS;
	} catch (error) {
		console.log("Error sending email : \n", error);
		return RESPONSES.INTERNAL_ERROR;
	}
}
