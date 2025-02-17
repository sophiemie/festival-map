# Basis-Image für Node.js
FROM node:18

# Arbeitsverzeichnis setzen
WORKDIR /src

# Abhängigkeiten kopieren und installieren
COPY package.json package-lock.json ./
RUN npm install

# Source-Code kopieren
COPY . .

# Sicherstellen, dass die Swagger-Datei existiert
RUN ls -la docs/

# Port für den Server öffnen
EXPOSE 4000

# Server starten (richtiger Pfad)
CMD ["node", "server.js"]
