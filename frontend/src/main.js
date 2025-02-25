import { createMap, addMarkers } from './components/map.js';
import { closePopup } from './components/info.js';
import { toggleDraggableMarker } from './components/marker.js';// Importiere die Marker-Funktion
import './components/bandsearch.js';


// Warte, bis das DOM vollständig geladen ist
document.addEventListener("DOMContentLoaded", () => {
    const map = createMap();

    /* Karte laden */
    fetch('festivals2025.json')
        .then(response => response.json())
        .then(data => {
            addMarkers(map, data);
        })
        .catch(error => console.error('Error loading the JSON file:', error));

    // Listener, um das Band-Pop-up zu schließen
    document.addEventListener('click', (event) => {
        const popup = document.getElementById('band-popup');
        const bandsList = document.getElementById('festival-bands');

        if (popup && !popup.contains(event.target) && !bandsList.contains(event.target)) {
            closePopup();
        }
    });

    /* Künstlersuche */
    document.getElementById("search-input").addEventListener("keypress", async (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            const artistName = event.target.value.trim();

            if (artistName) {
                console.log(`API-Abfrage für: ${artistName}`);

                try {
                    const response = await fetch(`http://localhost:4000/api/artist/${artistName}`);

                    if (!response.ok) throw new Error("Fehlerhafte API-Antwort");
                    const artistData = await response.json();
                    console.log("Empfangene Daten:", artistData);

                    displayArtistInfo(artistData);
                } catch (error) {
                    console.error("Fehler bei der API-Abfrage:", error);
                }
            }
        }
    });

    // Funktion zum Anzeigen der Künstlerdaten
    const displayArtistInfo = (data) => {
        const name = data.artist?.name || "Unbekannter Künstler";
        const bio = data.artist?.bio?.summary || "Keine Biografie verfügbar.";
        alert(`Name: ${name}\nInfo: ${bio}`); // Später in UI einbauen
    };


    document.getElementById('marker-button').addEventListener('click', () => {
        toggleDraggableMarker(map);
    });
});
