import { Resend } from "resend";
import { ApiResType } from "./APIResponse";

const resend = new Resend(process.env.RESEND_API_KEY);
export interface emailConfig {
	to: string;
	subject: string;
	react: React.ReactNode;
}

export async function sendEmail(emailConfig: emailConfig): Promise<ApiResType> {
	try {
		const from = "Mystery Message <manmohit@resend.dev>";

		const { data, error } = await resend.emails.send({ from, ...emailConfig });

		if (error) {
			return {
				success: false,
				message: "Error sending email",
				status: 500,
				data: error,
			};
		}
		return {
			success: true,
			message: "Email sent successfully",
			status: 200,
			data,
		};
    } catch (error:any) {
        console.log( "Error sending email" , error.message);
        
		return {
			success: false,
			message: "Error sending email",
			status: 500,
			data: { error },
		};
	}
}
