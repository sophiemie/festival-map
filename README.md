## Installation
Projekt mit Docker bauen um Dependencies zu installieren:
```
docker-compose build
```

## Einrichten des API-Keys
1. Gehen Sie zu https://www.last.fm/api.
2. Melden Sie sich an oder erstellen Sie ein Konto.
3. Erstellen Sie eine API-Anwendung und erhalten Sie Ihren API-Key.
4. Tragen Sie den API-Key in die .env-Datei unter 'LASTFM_API_KEY=IHR_API_KEY' ein.


## Starten
### Docker
Komplette Anwendung mit Docker starten:
```
docker-compose up
```
### Lokal
Starte Frontend lokal mit:
```bash
cd frontend
npx vite
```
Starte Backend lokal mit:
```bash
cd backend
cd src
node server.js
```
## Links
- Frontend: http://localhost:5173/
- Backend Swagger: http://localhost:4000/api-docs/


