// src/index.js

import "dotenv/config";
import express from "express";
import client from "./newsdataClient.js";
import { connectDB, closeDB } from "./database/db.js";
import { setupGracefulShutdown } from "./shutdown.js";
import streamRoutes from "./routes/stream.routes.js";
import registrationsRoutes from "./routes/registrations.routes.js";

const app = express();
const PORT = process.env.PORT;

app.get("/", (req, res) => {
	console.log("[news-stream] Health check endpoint hit");
	return res.json({ success: true, message: "App is running...." });
});

app.use("/stream", streamRoutes);
app.use("/registrations", registrationsRoutes);

connectDB()
	.then(() => {
		const server = app.listen(PORT, () =>
			console.log(`Server is running on port ${PORT}`),
		);

		setupGracefulShutdown({ server, client });
	})
	.catch((err) => {
		console.error("[mongodb] Failed to connect:", err.message);
		process.exit(1);
	});
