// src/newsStream.js

import {
	NewsDataApiClient,
	NewsDataApiWebSocket,
	NewsdataWebSocketAuthError,
	NewsdataWebSocketError,
	NewsdataApiError,
} from "newsdata-nodejs-client";
import { getDb } from "./database/db.js";

const NEWSDATA_API_KEY = process.env.NEWSDATA_API_KEY;

let ws = null;
let isStreaming = false;
let registrationId = null;

export async function startNewsStream() {
	if (!NEWSDATA_API_KEY) {
		throw new Error("NEWSDATA_API_KEY is not set in .env");
	}

	if (isStreaming) {
		throw new Error("Stream is already running.");
	}

	const client = new NewsDataApiClient(NEWSDATA_API_KEY);
	ws = new NewsDataApiWebSocket(client);

	try {
		// ? INFO: FOR QUERYING ---------
		const { results } = await ws.websocketRegister({
			q: "forex OR currency OR inflation OR war OR election OR sanctions",
			language: "en",
		});
		registrationId = results.registration_id;
		console.log(`[news-stream] Registered new query: ${registrationId}`);
	} catch (err) {
		if (err instanceof NewsdataApiError && err.statusCode === 409) {
			registrationId = err.responseBody.results.registration_id;
			console.log(
				`[news-stream] Reusing existing query: ${registrationId}`,
			);
		} else {
			throw err;
		}
	}

	isStreaming = true;
	(async () => {
		try {
			for await (const response of ws.stream(registrationId)) {
				// prettier-ignore
				for (const article of response.results) {
					console.log("─".repeat(60));
					console.log(`Title:       ${article.title}`);
					console.log(`Source:      ${article.source_name}`);
					console.log(`Date:        ${article.pubDate}`);
					console.log(`URL:         ${article.link}`);
					console.log(`Sentiment:   ${article.sentiment}`);
					console.log(`Description: ${article.description}`);
					console.log(`Content:     ${article.content ? article.content.slice(0, 200) + "..." : "(not available)"}`);
					console.log(".".repeat(60));

					try {
						const db = getDb();
						await db.collection("articles").insertOne(article);
					} catch (err) {
						console.error("[news-stream] Failed to save article:", err.message);
					}
				}
			}
		} catch (err) {
			if (err instanceof NewsdataWebSocketAuthError) {
				console.error("[news-stream] Rejected:", err.message);
			} else if (err instanceof NewsdataWebSocketError) {
				console.error("[news-stream] Stream error:", err.message);
			} else {
				console.error("[news-stream] Unexpected error:", err);
			}
		} finally {
			isStreaming = false;
		}
	})();

	return { registrationId };
}

export function closeNewsStream() {
	if (!isStreaming || !ws) {
		throw new Error("No stream is currently running.");
	}

	ws.close();
	isStreaming = false;
	ws = null;

	return { message: "Stream connection closed." };
}

export function getActiveRegistrationId() {
	return registrationId;
}
