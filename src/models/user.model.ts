import mongoose, { Schema, Document } from "mongoose";

export interface User extends Document {
	name: string;
	username: string;
	email: string;
	password: string;

	isActivated: boolean;
	activationCode: string;
	activationDeadline: Date;

    isAcceptingMessage: boolean;

    passwordResetToken: string;
    passwordResetExpiry: Date;
    
    createdAt: Date;
    updatedAt: Date;
}

const userSchema: Schema<User> = new Schema(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
		},
		username: {
			type: String,
			required: [true, "Username is required"],
			unique: [true, "Username already exists"],
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: [true, "Email already exists"],
			match: [/.+@.+\..+/, "Please enter a valid email address"],
		},
		password: {
			type: String,
			required: [true, "Password is required"],
		},
		isActivated: {
			type: Boolean,
			default: false,
		},
		activationCode: {
			type: String,
		},
		activationDeadline: {
			type: Date,
		},
		isAcceptingMessage: {
			type: Boolean,
			default: false,
        },
        passwordResetToken: {
            type: String,
        },
        passwordResetExpiry: {
            type: Date,
        },
	},
	{
		timestamps: true,
	}
);

// Mongoose doesn't update updatedAt automatically for `updateOne` and `updateMany`, so we need to add it manually
userSchema.pre("updateOne", function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

userSchema.pre("updateMany", function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

export const User =
	(mongoose.models.User as mongoose.Model<User>) ||
	mongoose.model<User>("User", userSchema);
