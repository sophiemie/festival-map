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
 */
router.get("/artist/:name", fetchArtistInfo);

export default router;
