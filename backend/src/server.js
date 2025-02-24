import express from "express";
import dotenv from "dotenv";
import lastfmRoutes from "./routes/lastfmRoutes.js";
import swaggerUi from "swagger-ui-express";
import yamljs from "yamljs";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = 4000;

app.use(cors()); // CORS für alle Anfragen aktivieren

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
