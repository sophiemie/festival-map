import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import https from "https"; // Importieren des https-Moduls

// Prüfe, ob die App im Docker läuft
const isDocker = process.env.DOCKER_ENV === "true";

// Setze den korrekten Pfad zur .env-Datei
const envPath = isDocker
    ? path.resolve("/data/.env") // Docker-Pfad
    : path.resolve(process.cwd(), "../.env"); // Lokaler Pfad


// Überprüfen, ob die .env-Datei existiert
if (!fs.existsSync(envPath)) {
    // Wenn keine .env-Datei existiert, erstellen wir sie mit einem leeren API-Key
    const defaultEnvContent = 'LASTFM_API_KEY=\n';
    fs.writeFileSync(envPath, defaultEnvContent, 'utf8');

    // Eine Nachricht in der Konsole ausgeben, wie der Prof einen API-Key erstellen kann
    console.log("Bitte kopieren Sie die /config/.env-template zu /config/.env")
    console.log("Um fortzufahren generieren Sie bitte einen eigenen API-Key von Last.fm:")
    console.log("1. Gehen Sie zu https://www.last.fm/api.");
    console.log("2. Melden Sie sich an oder erstellen Sie ein Konto.");
    console.log("3. Erstellen Sie eine API-Anwendung und erhalten Sie Ihren API-Key.");
    console.log("4. Tragen Sie den API-Key in die .env-Datei unter 'LASTFM_API_KEY=IHR_API_KEY' ein.");
    console.log("5. Starten Sie das Projekt erneut.");

    process.exit(); // Stoppt das Programm, da der API-Key fehlt
}


// Wenn .env Datei existiert
dotenv.config({ path: envPath });

const cache = {}; // Objekt als einfacher Cache

// Axios-Instanz mit einer benutzerdefinierten https-Agent-Konfiguration
const agent = new https.Agent({
    family: 4, // Erzwingt IPv4
});

const getArtistInfo = async (artistName, autocorrect = 1) => {
    if (cache[artistName]) {
        console.log(`Cache-Hit für ${artistName}`);
        return cache[artistName]; // Daten aus dem Cache zurückgeben
    }

    try {
        const apiKey = process.env.LASTFM_API_KEY;
        const url = `https://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=${encodeURIComponent(artistName)}&api_key=${apiKey}&format=json&autocorrect=${autocorrect}`;

        console.log(`Request an Last.fm: ${url}`);

        // Verwende die Axios-Instanz mit dem benutzerdefinierten Agent
        const response = await axios.get(url, { httpsAgent: agent });
        console.log("Antwort von Last.fm:", response.data); // Überprüfe die erhaltenen Daten

        // Extrahiere nur die Künstlernamen
        const similarArtists = response.data.similarartists.artist.map(artist => artist.name);
        console.log("Ähnliche Künstler:", similarArtists);

        cache[artistName] = similarArtists; // Nur die Künstlernamen speichern
        return similarArtists;
    } catch (error) {
        console.error("Fehler beim Abruf von Last.fm:", error.response?.data || error.message);
        throw new Error(`Fehler beim Abruf der Daten: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }
};


export { getArtistInfo };
