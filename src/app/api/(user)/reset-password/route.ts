import { APIResponse } from "@/lib/APIResponse";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/user.model";
import { NextRequest } from "next/server";
import bcrypt from "bcrypt";
import { passwordValidation } from "@/schemas/auth.schema";

const RESPONSES = {
	SUCCESS: {
		success: true,
		message: "Password reset successful",
		status: 200,
	},
	INVALID_REQUEST: (msg: string) => ({
		success: false,
		message: msg || "Invalid request",
		status: 400,
	}),
	USER_NOT_FOUND: {
		success: false,
		message: "No active user account found",
		status: 404,
	},
	INTERNAL_ERROR: {
		success: false,
		message: "Some internal error occurred while resetting password",
		status: 500,
	},
};

export async function POST(req: NextRequest) {
	try {
		await dbConnect();

		const { userId, token, newPassword } = await req.json();

		const validateRes = passwordValidation.safeParse(newPassword);

		if (!validateRes.success) {
			const zodErrorMsg = JSON.parse(validateRes.error.message)[0].message;
			return APIResponse(RESPONSES.INVALID_REQUEST(zodErrorMsg));
		}

		const user = await User.findById(userId);

		if (!user || !user.isActivated)
			return APIResponse(RESPONSES.USER_NOT_FOUND);

		const passwordResetToken = user.passwordResetToken;
		const passwordResetExpiry = user.passwordResetExpiry;

		const isTokenValid = await bcrypt.compare(token, passwordResetToken);

		if (
			!user.passwordResetToken ||
			!isTokenValid ||
			passwordResetExpiry < new Date()
		)
			return APIResponse(
				RESPONSES.INVALID_REQUEST(" Invalid or expired password reset link.")
			);

		const password = await bcrypt.hash(newPassword, 10);

		const updatedUser = await user.updateOne({
			passwordResetToken: "",
			passwordResetExpiry: new Date(),
			password,
		});

		if (updatedUser.modifiedCount === 0)
			return APIResponse(RESPONSES.INTERNAL_ERROR);

		return APIResponse(RESPONSES.SUCCESS);
	} catch (error) {
		console.log("Error resetting password : \n", error);

		return APIResponse(RESPONSES.INTERNAL_ERROR);
	}
}
