// src/routes/registrations.routes.js

import { Router } from "express";
import client from "../newsdataClient.js";

const router = Router();

router.get("/", async (req, res) => {
	console.log("[news-stream] Fetching registrations");

	try {
		const data = await client.websocketFetch();
		return res.json(data);
	} catch (err) {
		return res.status(err.statusCode || 500).json({ error: err.message });
	}
});

router.get("/:id", async (req, res) => {
	const registrationId = req.params.id;

	if (!registrationId)
		return res.status(400).json({ error: "Registration ID is required" });

	console.log(`[news-stream] Deleting registration ${registrationId}`);

	try {
		const data = await client.websocketDelete(registrationId);
		return res.json(data);
	} catch (err) {
		return res.status(err.statusCode || 500).json({ error: err.message });
	}
});

export default router;
