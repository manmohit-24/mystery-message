import mongoose from "mongoose";

/* This file contains a function to connect to the database */

type ConnectionObject = {
	isConnected?: number;
};

const connection: ConnectionObject = {};

export default async (): Promise<void> => {
	
    if (connection.isConnected) {
		console.log("Already connected to database");
		return;
	}

	try {
		const db = await mongoose.connect(process.env.MONGODB_URI || "");
		connection.isConnected = db.connections[0].readyState;

		console.log("Connected to database");
	} catch (error) {
		console.log("Error connecting to database: \n", error);
		process.exit(1);
	}
};
