import z from "zod";

/* Zod Validation Schema for Auth related data */

export const usernameValidation = z
	.string()
	.min(3, "Username must be at least 3 characters long")
	.max(15, "Username must be at most 15 characters long")
	.regex(
		/^[a-zA-Z0-9_]+$/,
		"Username must only contain letters, numbers, and underscores"
	);

export const emailValidation = z
	.string()
	.email("Please enter a valid email address")
	.min(5, "Email must be at least 5 characters long")
	.max(50, "Email must be at most 50 characters long");

export const passwordValidation = z
	.string()
	.min(8, "Password must be at least 8 characters long")
	.max(50, "Password must be at most 50 characters long");

export const nameValidation = z
	.string("Name is required")
	.min(3, "Name must be at least 3 characters long")
	.max(50, "Name must be at most 50 characters long");

export const registerSchema = z.object({
	name: nameValidation,
	username: usernameValidation,
	email: emailValidation,
	password: passwordValidation,
});

export const logInSchema = z.object({
	identifier: z.union([emailValidation, usernameValidation]),
	password: passwordValidation,
});

export const activationCodeSchema = z
	.string( "Verification code is required" )
	.length(6, "Verification code must be 6 digits long");

