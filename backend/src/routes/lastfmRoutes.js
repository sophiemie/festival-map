import express from "express";
import fs from "fs";
import path from "path";
import { fetchArtistInfo } from "../controllers/lastfmController.js";
import { getArtistInfo } from "../services/lastfmService.js";

const router = express.Router();
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const isDocker = process.env.DOCKER_ENV === 'true';  // Setze diese Variable, wenn du im Docker-Container bist

let filePath;
if (isDocker) {
    filePath = path.join(process.cwd(), "/app/shared/selectedBands.json"); // Docker
} else {
    filePath = path.join(process.cwd(), "/../../frontend/selectedBands.json"); // Lokal
}

console.log('Dateipfad:', filePath);



router.get("/artist/:name", fetchArtistInfo);

router.post("/artists/similar", async (req, res) => {
    try {
        const { bands } = req.body;
        if (!bands || !Array.isArray(bands)) {
            return res.status(400).json({ error: "Bands müssen als Array gesendet werden." });
        }

        const similarArtists = {};

        for (const band of bands) {
            await delay(1000);
            const response = await getArtistInfo(band); // Holt NUR die Namen, nicht das gesamte JSON
            similarArtists[band] = response;
        }

        // Datei speichern
        fs.writeFileSync("/app/shared/selectedBands.json", JSON.stringify(similarArtists, null, 2), "utf8");

        console.log("Gespeicherte Daten:", JSON.stringify(similarArtists, null, 2));
        res.json(similarArtists);
    } catch (error) {
        console.error("Fehler beim Abrufen ähnlicher Künstler:", error);
        res.status(500).json({ error: "Interner Serverfehler" });
    }
});


export default router;
