# Basis-Image für Node.js
FROM node:18

# Arbeitsverzeichnis setzen
WORKDIR /data

# Source-Code kopieren
COPY . /data

# Abhängigkeiten kopieren und installieren
RUN npm install

# Port für Vite öffnen
EXPOSE 5173

# Vite starten
CMD ["npm", "run", "dev"]
