// src/database/db.js

import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGO_URI;

let client;
let db;

export async function connectDB() {
	if (db) return db;

	if (!MONGO_URI) {
		throw new Error("MONGO_URI is not set in .env");
	}

	client = new MongoClient(MONGO_URI);
	await client.connect();

	db = client.db();
	console.log("[mongodb] Connected successfully");

	await client.db("admin").command({ ping: 1 });
	console.log("[mongodb] Ping successful — connection confirmed");

	return db;
}

export function getDb() {
	if (!db) {
		throw new Error("Database not connected yet. Call connectDB() first.");
	}
	return db;
}

export async function closeDB() {
	if (client) {
		await client.close();
		console.log("[mongodb] Connection closed");
	}
}
