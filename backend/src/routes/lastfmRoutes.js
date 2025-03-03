import express from "express";
import { getSimilarArtists } from "../controllers/lastfmController.js";

const router = express.Router();

router.post("/artists/similar", getSimilarArtists);

export default router;
