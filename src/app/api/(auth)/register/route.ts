import bcrypt from "bcrypt";
import { NextRequest } from "next/server";
import { User } from "@/models/user.model";
import connectDB from "@/lib/dbConnect";
import { APIResponse, safeUserResponse } from "@/lib/APIResponse";
import { registerSchema } from "@/schemas/auth.schema";
import { generateCode } from "@/lib/generateCode";
import { sendEmail, emailConfig } from "@/lib/sendEmail";
import { VerificationEmailTemplate } from "@/components/emails/VerifyEmailTemplate";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

const RESPONSES = {
	SUCCESS: (data: object) => ({
		success: true,
		message: "User registered successfully",
		status: 200,
		data,
	}),
	INVALID_REQUEST: (msg: string) => ({
		success: false,
		message: msg || "Invalid request",
		status: 400,
	}),
	USER_ALREADY_EXISTS_EMAIL: {
		success: false,
		message: "User with this email already exists",
		status: 400,
	},
	USER_ALREADY_EXISTS_USERNAME: {
		success: false,
		message: "User with this username already exists",
		status: 400,
	},
	ALREADY_LOGGED_IN: {
		success: false,
		message: "Already Logged In",
		status: 401,
	},
	INTERNAL_ERROR: {
		success: false,
		message: "Some internal error occurred while registering user",
		status: 500,
	},
};

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (session && session.user._id !== "guest")
			return APIResponse(RESPONSES.ALREADY_LOGGED_IN);

		await connectDB();

		const body = await request.json();
		const { name, username, email, password } = body;

		const validateRes = registerSchema.safeParse(body);
		if (!validateRes.success) {
			const zodErrorMsg = JSON.parse(validateRes.error.message)[0].message;
			return APIResponse(RESPONSES.INVALID_REQUEST(zodErrorMsg));
		}

		// check if a User with this email already exists
		const existingUserByEmail = await User.findOne({ email });
		if (existingUserByEmail) {
			// check if a verified user with this email already exists
			if (existingUserByEmail.isActivated)
				return APIResponse(RESPONSES.USER_ALREADY_EXISTS_EMAIL);

			// so user exists but is unverified
			// check if the verification code has expired
			if (existingUserByEmail.activationDeadline < new Date()) {
				// the user can't verify his email now , just delete that user to free the email
				await User.deleteOne({ _id: existingUserByEmail._id });
			} else return APIResponse(RESPONSES.USER_ALREADY_EXISTS_EMAIL);
		}

		// check if a verified user with this username already exists
		const existingUserByUsername = await User.findOne({ username });
		if (existingUserByUsername) {
			if (
				!existingUserByUsername.isActivated &&
				existingUserByUsername.activationDeadline < new Date()
			) {
				// an unverified User with this username already exists
				// and the verification code has expired
				// just delete that user to free the username
				await User.deleteOne({ _id: existingUserByUsername?._id });
			} else return APIResponse(RESPONSES.USER_ALREADY_EXISTS_USERNAME);
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const activationCode = generateCode(6);
		const activationDeadline = new Date(Date.now() + 60 * 60 * 1000);

		const user = new User({
			name,
			username,
			email,
			password: hashedPassword,
			activationCode,
			activationDeadline,
		});
		const resUser = await user.save();

		if (!resUser) return APIResponse(RESPONSES.INTERNAL_ERROR);

		const emailConfig: emailConfig = {
			to: resUser.email,
			subject: "Verify your account",
			react: VerificationEmailTemplate({
				name: resUser.name,
				validationCode: resUser.activationCode,
			}),
		};

		const emailRes = await sendEmail(emailConfig);

		if (!emailRes.success) return APIResponse(emailRes);

		return APIResponse(RESPONSES.SUCCESS(safeUserResponse(resUser)));
	} catch (error) {
		console.log("Error registering user : \n", error);

		return APIResponse(RESPONSES.INTERNAL_ERROR);
	}
}
