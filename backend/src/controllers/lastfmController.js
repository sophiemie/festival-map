import fs from "fs";
import { getArtistInfo } from "../services/lastfmService.js";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getSimilarArtists = async (req, res) => {
    try {
        const { bands } = req.body;
        if (!bands || !Array.isArray(bands)) {
            return res.status(400).json({ error: "Bands müssen als Array gesendet werden." });
        }

        const similarArtists = {};

        for (const band of bands) {
            await delay(1000);
            const response = await getArtistInfo(band);
            similarArtists[band] = response;
        }

        fs.writeFileSync("/app/shared/selectedBands.json", JSON.stringify(similarArtists, null, 2), "utf8");

        console.log("Gespeicherte Daten:", JSON.stringify(similarArtists, null, 2));
        res.json(similarArtists);
    } catch (error) {
        console.error("Fehler beim Abrufen ähnlicher Künstler:", error);
        res.status(500).json({ error: "Interner Serverfehler" });
    }
};
