import { APIResponse } from "@/lib/APIResponse";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/user.model";
import { NextRequest } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
	await dbConnect();

	try {
		const { userId, token, newPassword } = await req.json();

		// check if a User with this username already exists
		const user = await User.findById(userId);

		if (!user || !user.isActivated) {
			return APIResponse({
				success: false,
				message: "no active user account found",
				data: {},
				status: 400,
			});
		}

		const passwordResetToken = user.passwordResetToken;
		const passwordResetExpiry = user.passwordResetExpiry;

		const isTokenValid = await bcrypt.compare(token, passwordResetToken);

		if (!user.passwordResetToken || !isTokenValid || passwordResetExpiry < new Date()) {
			return APIResponse({
				success: false,
				message: "Invalid or expired password reset link.",
				status: 400,
				data: {},
			});
		}

		const password = await bcrypt.hash(newPassword, 10);

		const updatedUser = await user.updateOne({
			passwordResetToken: "",
			passwordResetExpiry: new Date(),
			password,
		});

		if (updatedUser.modifiedCount === 0) {
			return APIResponse({
				success: false,
				message: "Error updating user",
				data: {},
				status: 500,
			});
		}

		return APIResponse({
			success: true,
			message: "Password reset successful",
			data: {},
			status: 200,
		});
	} catch (error: any) {
		return APIResponse({
			success: false,
			message: error.message || "Internal Error",
			data: { error },
			status: 500,
		});
	}
}
