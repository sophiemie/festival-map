import express from "express";
import dotenv from "dotenv";
import lastfmRoutes from "./routes/lastfmRoutes.js";
import swaggerUi from "swagger-ui-express";
import yamljs from "yamljs";

dotenv.config();

const app = express();
const PORT = 4000;

// Swagger laden
const swaggerDocument = yamljs.load("./docs/swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routen einbinden
app.use("/api", lastfmRoutes);

app.listen(PORT, () => console.log(`Server läuft auf http://localhost:${PORT}`));
