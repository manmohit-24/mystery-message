import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/user.model";
import { sendEmail, emailConfig } from "@/lib/sendEmail";
import { LoginAlert } from "@/components/emails/LoginAlert";
import { NextRequest } from "next/server";
import { constants } from "@/lib/constants";

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
					const { identifier, password } = credentials;

					const user = await User.findOne({
						$or: [{ email: identifier }, { username: identifier }],
					});

					if (!user) {
						throw new Error("Invalid email or password");
					}

					if (!user.isActivated) {
						throw new Error("Please verify your account to login");
					}

					const isPasswordValid = await bcrypt.compare(password, user.password);
					if (!isPasswordValid) {
						throw new Error("Invalid email or password");
					}

					const emailConfig: emailConfig = {
						to: user.email,
						subject: `New login to your ${appName} account`,
						react: LoginAlert({
							name: user.name,
							loginTime: new Date(),
							deviceInfo: req.headers ? req.headers["user-agent"] : "Unkown",
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
