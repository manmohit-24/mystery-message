import mongoose, { Schema, Document } from "mongoose";

export interface Message extends Document {
	content: string;
	sender?: mongoose.Schema.Types.ObjectId;
	receiver: mongoose.Schema.Types.ObjectId;
	isAnonymous: boolean;
	isTrulyAnonymous: boolean;
	DeletedForSender: boolean;
	DeletedForReceiver: boolean;
}

const messageSchema: Schema<Message> = new Schema(
	{
		content: {
			type: String,
			required: true,
		},
		sender: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: false,
		},
		receiver: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		isAnonymous: {
			type: Boolean,
			default: false,
		},
		isTrulyAnonymous: {
			type: Boolean,
			default: false,
		},
		DeletedForSender: {
			type: Boolean,
			default: false,
		},
		DeletedForReceiver: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

// Mongoose doesn't update updatedAt automatically for `updateOne` and `updateMany`, so we need to add it manually
messageSchema.pre("updateOne", function (next) {
	this.set({ updatedAt: new Date() });
	next();
});

messageSchema.pre("updateMany", function (next) {
	this.set({ updatedAt: new Date() });
	next();
});

export const Message =
	(mongoose.models.Message as mongoose.Model<Message>) ||
	mongoose.model<Message>("Message", messageSchema);
