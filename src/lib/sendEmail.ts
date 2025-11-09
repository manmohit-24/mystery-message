import { Resend } from "resend";
import { constants } from "./constants";

// Imports for nodemailer :-
import nodemailer from "nodemailer";
import { render } from "@react-email/render";

export interface emailConfig {
	to: string;
	subject: string;
	react: React.ReactNode;
}

/* For now, I are not having a verified domin of my own. 
So temperorily using nodemailer for using my gmail for sending emails,
later we will be using resend once I got my domain 🥲*/
export async function sendEmail(emailConfig: emailConfig): Promise<void> {
	try {
		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: process.env.GMAIL_USER,
				pass: process.env.GMAIL_PASS,
			},
		});

		const emailHtml = await render(emailConfig.react);

		const res = await transporter.sendMail({
			from: `"${constants.appName}" <${process.env.GMAIL_USER}>`,
			to: emailConfig.to,
			subject: emailConfig.subject,
			html: emailHtml,
        });        

		if (res.rejected.length)
			console.log("Error, email not sent to : \n", res.rejected);
        else         console.log("send to ");

	} catch (error) {
		console.log("Error sending email : \n", error);
	}
}

/* ----------- For Resend : ----------
const resend = new Resend(process.env.RESEND_API_KEY);

export async function await sendEmail(emailConfig: emailConfig): Promise<ApiResType> {
	try {
		const from = `"${constants.appName}" <${process.env.RESEND_EMAIL}>`;

		const { error } = await resend.emails.send({ from, ...emailConfig });

		if (error) console.log("Error sending email : \n", error);


	} catch (error) {
		console.log("Error sending email : \n", error);
	}
}
*/
