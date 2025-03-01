import express from "express";
import dotenv from "dotenv";
import lastfmRoutes from "./routes/lastfmRoutes.js";
import swaggerUi from "swagger-ui-express";
import yamljs from "yamljs";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = 4000;

app.use(cors()); // CORS für alle Anfragen aktivieren

app.use(express.json()); // JSON-Parsing aktivieren

// Statische Datei-Freigabe für das gemeinsame Volume
app.use('/app/shared', express.static('/app/shared'));


// __dirname in ES-Modulen definieren
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prüfen, ob das Skript in Docker läuft (WORKDIR ist /data)
const isDocker = process.cwd() === "/data";
const swaggerPath = isDocker ? "/data/src/docs/swagger.yaml" : path.join(__dirname, "docs/swagger.yaml");
const swaggerDocument = yamljs.load(swaggerPath);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routen einbinden
app.use("/api", lastfmRoutes);

app.listen(PORT, () => console.log(`Server läuft auf http://localhost:${PORT}`));

const selectedBandsPath = path.join(__dirname, "selectedBands.json");

// API-Route zum Speichern der ausgewählten Bands
app.post("/api/save-bands", (req, res) => {
    const { bands } = req.body;

    if (!bands || !Array.isArray(bands)) {
        return res.status(400).json({ error: "Ungültige Daten" });
    }

    // JSON-Format: [{ name: "Bandname", similar_bands: [] }]
    const bandsData = bands.map(band => ({
        name: band,
        similar_bands: []
    }));

    fs.writeFile(selectedBandsPath, JSON.stringify(bandsData, null, 2), (err) => {
        if (err) {
            console.error("Fehler beim Speichern:", err);
            return res.status(500).json({ error: "Speicherung fehlgeschlagen" });
        }
        res.json({ message: "Bands erfolgreich gespeichert!" });
    });
});