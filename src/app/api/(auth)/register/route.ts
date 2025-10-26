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

export async function POST(request: NextRequest) {
	const session = await getServerSession(authOptions);

	if (session && session.user._id !== "guest") {
		return APIResponse({
			success: false,
			message: "Already Logged In",
			data: {},
			status: 401,
		});
	}

	// connecting to db
	await connectDB();

	try {
		const body = await request.json();
		const { name, username, email, password } = body;

		// validate received data
		const validateRes = registerSchema.safeParse(body);
		if (!validateRes.success) {
			const data = JSON.parse(validateRes.error.message)[0];
			return APIResponse({
				success: false,
				message: data.message || "Error registering user",
				data: {},
				status: 400,
			});
		}

		// check if a User with this email already exists
		const existingUserByEmail = await User.findOne({ email });
		if (existingUserByEmail) {
			// check if a verified user with this email already exists
			if (existingUserByEmail.isActivated) {
				return APIResponse({
					success: false,
					message:
						"User with this email already exists, please login or use another email",
					data: {},
					status: 400,
				});
			}

			// so user exists but is unverified
			// check if the verification code has expired
			if (existingUserByEmail.activationDeadline < new Date()) {
				// the user can't verify his email now
				// just delete that user to free the email
				await User.deleteOne({ _id: existingUserByEmail._id });
			} else {
				return APIResponse({
					success: false,
					message:
						"A user with this email is already registered, please check your email to activate your account",
					data: {},
					status: 400,
				});
			}
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
			} else {
				return APIResponse({
					success: false,
					message: "User with this username already exists",
					data: {},
					status: 400,
				});
			}
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
		const userDB = await user.save();

		if (!userDB) {
			return APIResponse({
				success: false,
				message: "Some internal error occured while registering user",
				data: {},
				status: 500,
			});
		}

		const emailConfig: emailConfig = {
			to: userDB.email,
			subject: "Verify your account",
			react: VerificationEmailTemplate({
				name: userDB.name,
				validationCode: userDB.activationCode,
			}),
		};

		const emailRes = await sendEmail(emailConfig);

		if (!emailRes.success) {
			return APIResponse(emailRes);
		}

		return APIResponse({
			success: true,
			message: "User registered successfully",
			data: safeUserResponse(userDB),
			status: 200,
		});
	} catch (error) {
		console.log("Error registering user \n", error);

		return APIResponse({
			success: false,
			message: "Some internal error occured while registering user",
			data: { error },
			status: 500,
		});
	}
}
