import express from "express";
import { fetchArtistInfo } from "../controllers/lastfmController.js";

const router = express.Router();

/**
 * @swagger
 * /artist/{name}:
 *   get:
 *     summary: Holt Infos zu einem Künstler von Last.fm
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Name des Künstlers
 *     responses:
 *       200:
 *         description: Erfolgreiche Antwort mit Künstler-Infos
 *       500:
 *         description: Fehler beim Abruf

router.get("/artist/:name", fetchArtistInfo);

router.post("/bands/similar", async (req, res) => {
    const { artists } = req.body;

    if (!artists || !Array.isArray(artists) || artists.length === 0) {
        return res.status(400).json({ error: "Es muss eine Liste von Künstlern angegeben werden." });
    }

    try {
        const results = {};

        for (const artist of artists) {
            try {
                const data = await getArtistInfo(artist);
                results[artist] = data.similarartists.artist.slice(0, 10).map(a => a.name);
            } catch (error) {
                results[artist] = { error: "Daten konnten nicht abgerufen werden." };
            }
        }

        res.json(results);
    } catch (error) {
        console.error("Fehler beim Abrufen der ähnlichen Künstler:", error);
        res.status(500).json({ error: "Interner Serverfehler" });
    }
}); */

export default router;
