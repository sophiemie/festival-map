import express from "express";
import { fetchArtistInfo } from "../controllers/lastfmController.js";
import { getArtistInfo } from "../services/lastfmService.js"; // Direkt den Service importieren

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
 */
router.get("/artist/:name", fetchArtistInfo);

router.post("/artists/similar", async (req, res) => {
    try {
        const { bands } = req.body; // Liste der ausgewählten Bands
        if (!bands || !Array.isArray(bands)) {
            return res.status(400).json({ error: "Bands müssen als Array gesendet werden." });
        }

        const similarArtists = {};

        for (const band of bands) {
            await delay(1000); // Throttle: 1 Sekunde warten

            const response = await getArtistInfo(band); // ✅ Direkt die API-Funktion aufrufen
            if (response && response.similar) {
                similarArtists[band] = response.similar;
            }
        }

        res.json(similarArtists);
    } catch (error) {
        console.error("Fehler beim Abrufen ähnlicher Künstler:", error);
        res.status(500).json({ error: "Interner Serverfehler" });
    }
});

export default router;
