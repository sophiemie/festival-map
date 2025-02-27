import express from "express";
import fs from "fs";
import path from "path";
import { fetchArtistInfo } from "../controllers/lastfmController.js";
import { getArtistInfo } from "../services/lastfmService.js";

const router = express.Router();
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const filePath = path.join(process.cwd(), "/../../frontend/selectedBands.json");

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

            const response = await getArtistInfo(band);
            console.log(`Antwort für ${band}:`, response);

            if (response && response.similarartists && response.similarartists.artist) {
                similarArtists[band] = response.similarartists.artist.map(artist => artist.name);
            } else {
                console.warn(`Keine ähnlichen Künstler für ${band} gefunden.`);
            }
        }

        // **JSON-Datei komplett überschreiben**
        fs.writeFileSync(filePath, JSON.stringify(similarArtists, null, 2), "utf8");

        console.log("Gespeicherte Daten:", JSON.stringify(similarArtists, null, 2));
        res.json(similarArtists);
    } catch (error) {
        console.error("Fehler beim Abrufen ähnlicher Künstler:", error);
        res.status(500).json({ error: "Interner Serverfehler" });
    }
});

export default router;
