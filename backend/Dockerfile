# Basis-Image für Node.js
FROM node:18

# Arbeitsverzeichnis setzen
WORKDIR /data

# Source-Code kopieren
COPY /src /data/src

# Abhängigkeiten kopieren und installieren
COPY package.json /data
COPY --chmod=0755 entry.sh /data/entrypoint.sh

RUN npm install

# Sicherstellen, dass die Swagger-Datei existiert
RUN ls -la /data/src/docs

# Port für den Server öffnen
EXPOSE 4000

# Server starten (richtiger Pfad)
ENTRYPOINT ["/data/entry.sh"]