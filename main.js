// Erstelle eine Karte und setze den View auf Deutschland
const map = L.map('map', {
    center: [51.1657, 10.4515],
    zoom: 6, // Standard-Zoomlevel
    minZoom: 6, // Minimales Zoomlevel (nicht weiter raus zoomen)
    maxZoom: 12, // Maximales Zoomlevel (weiter rein zoomen möglich)
}).setView([51.1657, 10.4515], 6); // Karte zentrieren

// Definiere die Grenzen für Deutschland
const bounds = [[47.2701, 5.8663], [55.0581, 15.0419]];

// Beschränke die Karte auf die Deutschland-Grenzen
map.setMaxBounds(bounds);

// Füge OpenStreetMap-Tiles hinzu
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Karte zentrieren und in den Grenzen halten
map.fitBounds(bounds);

// Lade die festivals2025.json und füge Marker mit Logos hinzu
fetch('festivals2025.json')
    .then(response => response.json())
    .then(data => {
        data.forEach(festival => {
            const { name, location, date, bands, logo } = festival;

            // Erstelle ein benutzerdefiniertes Icon mit dem Logo
            const customIcon = L.icon({
                iconUrl: logo, // Der Pfad zum Logo aus der JSON
                iconSize: [50, 50], // Größe des Icons (anpassbar)
                iconAnchor: [25, 50], // Position des Icons relativ zum Markerpunkt
                popupAnchor: [0, -50] // Position des Popups relativ zum Icon
            });

            // Füge den Marker mit dem benutzerdefinierten Icon hinzu
            L.marker([location.latitude, location.longitude], { icon: customIcon })
                .addTo(map)
                .bindPopup(`
                    <b>${name}</b><br>
                    Location: ${location.name}<br>
                    Date: ${date}<br>
                    Bands: ${bands.join(', ')}
                `);
        });
    })
    .catch(error => console.error('Error loading the JSON file:', error));
