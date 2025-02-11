import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: '../.env' });

console.log("Last.fm API Key aus .env:", process.env.LASTFM_API_KEY);

const getArtistInfo = async (artistName, autocorrect = 1) => {
    try {
        const apiKey = process.env.LASTFM_API_KEY;
        const url = `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(artistName)}&api_key=${apiKey}&format=json&autocorrect=${autocorrect}`;

        console.log(`Request an Last.fm: ${url}`); // Debugging

        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Fehler beim Abruf von Last.fm:", error.response?.data || error.message);

        throw new Error(`Fehler beim Abruf der Daten: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }
};

export { getArtistInfo };
