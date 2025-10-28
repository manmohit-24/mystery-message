import { z } from "zod";

export const resDataSchema = z
	.object({})
	.loose() // allow any extra fields
	.refine(
		(data) => {
			const forbiddenKeys = [
				"password",
				"activationCode",
				"activationDeadline",
				"passwordResetToken",
				"passwordResetExpiry",
				"DeletedForSender",
				"DeletedForReceiver",
			];

			const hasForbiddenKeys = (obj: any): boolean => {
				for (const key in obj) {
					if (forbiddenKeys.includes(key)) return true;
					if (typeof obj[key] === "object" && obj[key] !== null) {
						if (hasForbiddenKeys(obj[key])) return true;
					}
				}
				return false;
			};

			return !hasForbiddenKeys(data);
		},
		{
			message: "Sensitive fields detected in API response",
		}
	);
