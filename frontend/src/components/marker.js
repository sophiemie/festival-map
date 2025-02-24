let draggableMarker;
let radiusCircle;
let map; // map hier definieren

function addDraggableMarker(m) {
    map = m; // map zuweisen
    const addButton = document.getElementById('add-marker'); // Button hinzufügen
    const rangeInput = document.getElementById('range-input');

    addButton.addEventListener('click', () => {
        // Falls bereits ein Marker existiert, aktualisiere seine Position
        if (draggableMarker) {
            draggableMarker.setLatLng(map.getCenter());
            updateRadiusCircle();
        } else {
            // Erstelle einen neuen Marker
            draggableMarker = L.marker(map.getCenter(), {
                draggable: true,
                icon: L.icon({
                    iconUrl: 'images/marker.png', // Pfad zu deinem Marker-Bild
                    iconSize: [30, 30], // Größe des Icons
                    iconAnchor: [15, 30], // Punkt, an dem das Icon auf die Karte zeigt
                    popupAnchor: [0, -30] // Punkt, an dem das Popup erscheint
                })
            }).addTo(map);

            // Initialisiere den Radiuskreis
            updateRadiusCircle();

            // Event-Listener für Marker-Drag-Ende
            draggableMarker.on('dragend', (event) => {
                const marker = event.target;
                const position = marker.getLatLng();
                console.log(`Neuer Marker-Standort: ${position.lat}, ${position.lng}`);
                updateRadiusCircle(); // Aktualisiere den Radiuskreis beim Ziehen
            });
        }
    });

    // Event-Listener, um den Radius zu aktualisieren
    rangeInput.addEventListener('input', updateRadiusCircle);
}

function updateRadiusCircle() {
    const rangeInput = document.getElementById('range-input');
    const radius = parseFloat(rangeInput.value) || 0; // Standardwert auf 0 setzen

    // Wenn der Kreis bereits existiert, entferne ihn
    if (radiusCircle) {
        map.removeLayer(radiusCircle);
    }

    // Füge einen neuen Kreis hinzu, wenn der Radius größer als 0 ist
    if (radius > 0 && draggableMarker) {
        radiusCircle = L.circle(draggableMarker.getLatLng(), {
            radius: radius * 1000, // Umrechnung von km in Meter
            color: 'blue',
            fillColor: 'blue',
            fillOpacity: 0.1
        }).addTo(map); // map hier korrekt verwenden
    }
}

// Exportiere die Funktion
export { addDraggableMarker };
