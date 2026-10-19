// src/shutdown.js

import { closeNewsStream, getActiveRegistrationId } from "./newsStream.js";
import { closeDB } from "./database/db.js";

export function setupGracefulShutdown({ server, client }) {
	let isShuttingDown = false;

	async function shutdown(signal) {
		if (isShuttingDown) return;
		isShuttingDown = true;

		console.log(`\n[shutdown] ${signal} received, shutting down...`);

		server.close(() => {
			console.log("[shutdown] HTTP server closed");
		});

		try {
			const registrationId = getActiveRegistrationId();

			if (registrationId) {
				closeNewsStream();
				await client.websocketDelete(registrationId);
				console.log(`[shutdown] Registration ${registrationId} closed`);
			}
		} catch (err) {
			console.error("[shutdown] Error closing news stream:", err.message);
		}

		try {
			await closeDB();
		} catch (err) {
			console.error("[shutdown] Error closing database:", err.message);
		}

		process.exit(0);
	}

	process.on("SIGINT", () => shutdown("SIGINT"));
	process.on("SIGTERM", () => shutdown("SIGTERM"));
}
