import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/user.model";
import { sendEmail, emailConfig } from "@/lib/sendEmail";
import { LoginAlert } from "@/components/emails/LoginAlert";
import { ReWelcomeTemplate } from "@/components/emails/ReWelcomeTemplate";
import { constants } from "@/lib/constants";
import { getServerSession } from "next-auth";

const { appName } = constants;

export const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			id: "credentials",
			name: "Credentials",
			credentials: {
				identifier: { label: "Email or Username", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials: any, req): Promise<any> {
				await dbConnect();

				try {
					const session = await getServerSession(authOptions);

					if (session && session.user._id !== "guest")
						throw new Error("You are already logged in.");

					const { identifier, password } = credentials;

					const user = await User.findOne({
						$or: [{ email: identifier }, { username: identifier }],
					});

					if (!user) {
						throw new Error("Invalid credentials.");
					}
					/*
        User is validating for reactivation if activation deadline is more than 24 hours wrt to creatd at 
        as first verifiication code is genereatd at created time and at max expires after 1 hr 
        and reactivation deadline is 7 days so it will clearly be more than 1 day of created time.
        We need it for email template selection
        */
					const isReactivation =
						user.activationDeadline.getTime() >
						user.createdAt.getTime() + 24 * 60 * 60 * 1000;

					if (!user.isActivated && !isReactivation) {
						throw new Error(
							"Please activate your account to login. Check your email."
						);
					}

					const isPasswordValid = await bcrypt.compare(password, user.password);
					if (!isPasswordValid) {
						throw new Error("Invalid credentials.");
					}

					if (!user.isActivated && isReactivation) {
						const updatedUser = await user.updateOne({
							isActivated: true,
							activationCode: "",
							activationDeadline: new Date(),
							isAcceptingMessage: true,
						});

						if (updatedUser.modifiedCount === 0)
							throw new Error(
								"Something went wrong while reactivating your account."
							);
					}

					const emailConfig: emailConfig = {
						to: user.email,
						subject: isReactivation
							? `Welcome Back to ${appName}`
							: `New login to your ${appName} account`,
						react: isReactivation
							? ReWelcomeTemplate({
									name: user.name,
									loginTime: new Date(),
									deviceInfo: req.headers
										? req.headers["user-agent"]
										: "Unkown",
								})
							: LoginAlert({
									name: user.name,
									loginTime: new Date(),
									deviceInfo: req.headers
										? req.headers["user-agent"]
										: "Unkown",
								}),
					};

					await sendEmail(emailConfig);

					return user;
				} catch (error: any) {
					throw new Error(error);
				}
			},
		}),
		CredentialsProvider({
			id: "guest",
			name: "guest",
			credentials: {},
			async authorize(): Promise<any> {
				return {
					_id: "guest",
				};
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token._id = user._id.toString();
			}
			return token;
		},
		async session({ session, token }) {
			if (token) {
				session.user._id = token._id;
			}
			return session;
		},
	},
	pages: {
		signIn: "/login",
	},
	session: {
		strategy: "jwt",
	},
	secret: process.env.NEXTAUTH_SECRET,
};
