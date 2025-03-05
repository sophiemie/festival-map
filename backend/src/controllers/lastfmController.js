import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getArtistInfo } from "../services/lastfmService.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getSimilarArtists = async (req, res) => {
    try {
        const { bands } = req.body;
        if (!bands || !Array.isArray(bands)) {
            return res.status(400).json({ error: "Bands müssen als Array gesendet werden." });
        }

        // Aktuellen Dateipfad bestimmen
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        // Korrekten absoluten Pfad setzen
        const filePath = path.join(__dirname, "..", "app", "shared", "selectedBands.json");

        // Neue Daten abrufen
        const similarArtists = {};
        for (const band of bands) {
            await delay(1000);
            const response = await getArtistInfo(band);
            similarArtists[band] = response;
        }

        // JSON-Datei überschreiben
        fs.writeFileSync(filePath, JSON.stringify(similarArtists, null, 2), "utf-8");

        console.log("Gespeicherte Daten:", JSON.stringify(similarArtists, null, 2));
        res.json(similarArtists);
    } catch (error) {
        console.error("Fehler beim Abrufen ähnlicher Künstler:", error);
        res.status(500).json({ error: "Interner Serverfehler" });
    }
};
