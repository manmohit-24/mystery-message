import crypto from "crypto";

export function generateCode(length: number = 6): string {
	const charset = "abcdefghijklmnopqrstuvwxyzZ0123456789";
	const bytes = crypto.randomBytes(length);
	let code = "";

	for (let i = 0; i < length; i++) {
		const index = bytes[i] % charset.length;
		code += charset[index];
	}

	return code;
}
