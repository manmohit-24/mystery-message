import mongoose, { PipelineStage } from "mongoose";

const receiverPipelineConfig = {
	match: {
		DeletedForReceiver: false,
	},
	lookup: {
		let: {
			senderId: "$sender",
			isAnonymous: "$isAnonymous",
		},
		pipeline: [
			{
				$match: {
					$expr: {
						$and: [
							{ $eq: ["$$isAnonymous", false] }, // Only make a lookup if msg is non-anonymous
							{ $eq: ["$_id", "$$senderId"] },
						],
					},
				},
			},
		],
	},

	project: {
		sender: {
			$cond: {
				if: { $eq: ["$isAnonymous", true] },
				then: {
					_id: null,
					username: "Anonymous",
					name: "Anonymous",
				},
				else: {
					_id: "$sender",
					username: {
						$ifNull: ["$anotherUserData.username", "User Deleted"],
					},
					name: {
						$ifNull: ["$anotherUserData.name", "User Deleted"],
					},
				},
			},
		},
	},
};

const senderPipelineConfig = {
	match: {
		DeletedForSender: false,
	},
	lookup: {
		localField: "receiver",
		foreignField: "_id",
	},

	project: {
		receiver: {
			_id: "$receiver",
			username: {
				$ifNull: ["$anotherUserData.username", "User Deleted"],
			},
			name: {
				$ifNull: ["$anotherUserData.name", "User Deleted"],
			},
		},
	},
};

export function getMessagesPipeline({
	role,
	userId,
	cursor,
	limit,
}: {
	role: string;
	userId: string;
	cursor: string | null;
	limit: number;
}): PipelineStage[] {
	const { match, lookup, project } =
		role === "receiver" ? receiverPipelineConfig : senderPipelineConfig;

	const matchId = cursor
		? { _id: { $lt: new mongoose.Types.ObjectId(cursor) } }
		: {};

	const pipeline: PipelineStage[] = [
		{
			$match: {
				[role]: new mongoose.Types.ObjectId(userId),
				...match,
				...matchId,
			},
		},
		{ $sort: { createdAt: -1 } },
		{ $limit: limit },
		{
			$lookup: {
				from: "users",
				as: "anotherUserData",
				...lookup,
			},
		},
		{ $unwind: { path: "$anotherUserData", preserveNullAndEmptyArrays: true } },
		{
			$project: {
				_id: 1,
				content: 1,
				createdAt: 1,
				isAnonymous: 1,
				isTrulyAnonymous: 1,
				...project,
			},
		},
	];

	return pipeline;
}
