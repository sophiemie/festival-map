import { getArtistInfo } from "../services/lastfmService.js";

const fetchArtistInfo = async (req, res) => {
    const { name } = req.params;
    if (!name) {
        return res.status(400).json({ error: "Künstlername ist erforderlich" });
    }

    try {
        const artistInfo = await getArtistInfo(name);
        if (!artistInfo) {
            return res.status(404).json({ error: "Künstler nicht gefunden" });
        }
        res.status(200).json(artistInfo);
    } catch (error) {
        console.error("Fehler im Controller:", error);
        res.status(500).json({ error: error.message });
    }
};

export { fetchArtistInfo };
