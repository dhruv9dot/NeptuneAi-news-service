// src/routes/stream.routes.js

import { Router } from "express";
import { startNewsStream, closeNewsStream } from "../newsStream.js";
import client from "../newsdataClient.js";

const router = Router();

router.get("/start", async (req, res) => {
	console.log("[news-stream] Starting news stream");
	try {
		const { registrationId } = await startNewsStream();

		console.log(
			`[news-stream] News stream started with registration ID: ${registrationId}`,
		);
		return res.json({
			success: true,
			message: "Streaming started successfully.",
			registrationId,
		});
	} catch (err) {
		return res.status(err.statusCode || 500).json({
			success: false,
			message: err.message,
		});
	}
});

router.get("/close/:id", async (req, res) => {
	console.log("[news-stream] Closing news stream");
	try {
		const registrationId = req.params.id;

		if (!registrationId)
			return res.status(400).json({
				error: "Registration ID is required",
			});

		const result = closeNewsStream();
		const data = await client.websocketDelete(registrationId);

		return res.json({ success: true, ...result });
	} catch (err) {
		return res.status(400).json({
			success: false,
			message: err.message,
		});
	}
});

export default router;
