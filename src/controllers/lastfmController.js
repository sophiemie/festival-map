import { getArtistInfo } from "../services/lastfmService.js";

const fetchArtistInfo = async (req, res) => {
    try {
        const artistName = req.params.name;
        console.log(`Anfrage für Künstler: ${artistName}`); // Logging hinzufügen

        const data = await getArtistInfo(artistName);
        res.json(data);
    } catch (error) {
        console.error("Fehler beim Abruf von Last.fm:", error);
        res.status(500).json({ error: "Fehler beim Abruf der Daten" });
    }
};

export { fetchArtistInfo };
