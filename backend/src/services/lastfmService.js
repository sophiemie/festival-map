import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Prüfe, ob die App im Docker läuft
const isDocker = process.env.DOCKER_ENV === "true";

// Setze den korrekten Pfad zur .env-Datei
const envPath = isDocker
    ? path.resolve("/data/.env") // Docker-Pfad
    : path.resolve(process.cwd(), "../.env"); // Lokaler Pfad

dotenv.config({ path: envPath });

const cache = {}; // Objekt als einfacher Cache

const getArtistInfo = async (artistName, autocorrect = 1) => {
    if (cache[artistName]) {
        console.log(`Cache-Hit für ${artistName}`);
        return cache[artistName]; // Daten aus dem Cache zurückgeben
    }

    try {
        const apiKey = process.env.LASTFM_API_KEY;
        const url = `https://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=${encodeURIComponent(artistName)}&api_key=${apiKey}&format=json&autocorrect=${autocorrect}`;

        console.log(`Request an Last.fm: ${url}`);

        const response = await axios.get(url);
        console.log("Antwort von Last.fm:", response.data); // Überprüfe die erhaltenen Daten

        // Hier speichern wir die Response in einer Textdatei
        const filePath = path.join(process.cwd(), "/../../frontend/selectedBands.json"); // Pfad zur Textdatei
        fs.writeFileSync(filePath, JSON.stringify(response.data, null, 2)); // Schreibe die Response in die Textdatei

        const similarArtists = response.data.similarartists.artist.map(artist => artist.name);
        console.log("Ähnliche Künstler:", similarArtists);

        cache[artistName] = response.data; // Speichert das Ergebnis im Cache
        return response.data;
    } catch (error) {
        console.error("Fehler beim Abruf von Last.fm:", error.response?.data || error.message);
        throw new Error(`Fehler beim Abruf der Daten: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }
};

export { getArtistInfo };
