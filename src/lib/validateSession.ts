import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/(auth)/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/user.model";
import { ApiResType } from "./APIResponse";
export async function validateSession({
	allowGuest = false,
	allowNonActivated = false,
}: {
	allowGuest?: boolean;
	allowNonActivated?: boolean;
}): Promise<ApiResType> {
	const session = await getServerSession(authOptions);
	if (!session || !session.user) {
		return {
			success: false,
			message: "Not Authenticated",
			status: 401,
		};
	}

	const userId = session.user._id;

    /* FIX TO AN ISSUE :-
    Previously we were connecting to db after checking for guest (at line 55), becuase we not need to fetch the guest details from db, they are not stored in db.
    But we forgot that this funtion is used in our project with assumption that db was connected within call of this function.
    So we were not calling dbConnect function in routes where we call this function, but if user was guest, db was not connected and we was getting runtime errors from that routes.
    So we are here connecting to db even before checking for guest
    */
	await dbConnect();

	if (userId === "guest") {
		if (allowGuest) {
			return {
				success: true,
				message: "Guest session is valid",
				data: {
					user: {
						_id: "guest",
						name: "Guest",
						username: "guest",
						email: "guest",
					},
				},
				status: 200,
			};
		}
		return {
			success: false,
			message: "Guests can't perform this action",
			status: 401,
		};
	}
    try {
        // previously we were calling dbConnect here
        // await dbConnect();

		const user = await User.findById(userId);
		if (!user) {
			return {
				success: false,
				message: "User not found",
				data: { shouldLogOut: true },
				status: 404,
			};
		}
		if (!allowNonActivated && !user.isActivated) {
			return {
				success: false,
				message: "User is not activated",
				data: { shouldLogOut: true },
				status: 401,
			};
		}
		return {
			success: true,
			message: "Session is valid",
			data: { user },
			status: 200,
		};
	} catch (error) {
		console.log("Error validating session : \n", error);

		return {
			success: false,
			message: "Error validating session",
			status: 500,
		};
	}
}
