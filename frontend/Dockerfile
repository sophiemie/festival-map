# Basis-Image für Node.js
FROM node:18

# Arbeitsverzeichnis setzen
WORKDIR /src

# Abhängigkeiten kopieren und installieren
COPY package.json package-lock.json ./
RUN npm install

# Source-Code kopieren
COPY . .

# Port für Vite öffnen
EXPOSE 5173

# Vite starten
CMD ["npm", "run", "dev"]
