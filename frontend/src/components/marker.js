import festivals from '../../festivals2025.json'; // Stelle sicher, dass der Pfad korrekt ist

function haversineDistance(coord1, coord2) {
    const toRad = (x) => (Number(x) * Math.PI) / 180; // Sicherstellen, dass es eine Zahl ist

    const lat1 = toRad(coord1.latitude);
    const lon1 = toRad(coord1.longitude);
    const lat2 = toRad(coord2.latitude);
    const lon2 = toRad(coord2.longitude);

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const R = 6371; // Erdradius in Kilometern
    return R * c; // Entfernung in Kilometern
}


function toggleDraggableMarker(map) {
    const rangeInput = document.getElementById('range-input');
    const removeMarkerIcon = document.getElementById('remove-marker');

    if (!map) return console.error("Map ist nicht definiert!");

    if (window.userMarker) {
        map.removeLayer(window.userMarker);
        map.removeLayer(window.userCircle);
        window.userMarker = null;
        window.userCircle = null;
        rangeInput.style.display = 'none';
        removeMarkerIcon.style.display = 'none';
        return;
    }

    const icon = L.icon({
        iconUrl: 'images/marker.png',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
    });

    const marker = L.marker(map.getCenter(), {
        icon: icon,
        draggable: true
    }).addTo(map);

    const radius = rangeInput.value || 100;
    let circle = L.circle(marker.getLatLng(), { radius: radius * 1000 }).addTo(map);

    window.userMarker = marker;
    window.userCircle = circle;

    rangeInput.style.display = 'inline-block';
    removeMarkerIcon.style.display = 'block';

    marker.on('drag', () => {
        circle.setLatLng(marker.getLatLng());
        calculateDistances(marker.getLatLng());
    });

    marker.on('dragend', () => {
        calculateDistances(marker.getLatLng()); // Sofort nach dem Loslassen berechnen
    });

    rangeInput.addEventListener('input', (e) => {
        circle.setRadius(e.target.value * 1000);
    });

    calculateDistances(marker.getLatLng()); // Direkt nach Setzen des Markers berechnen
}


function calculateDistances(userPosition) {
    const userCoord = {
        latitude: Number(userPosition.lat),
        longitude: Number(userPosition.lng)
    };

    const distances = festivals.map(festival => {
        const festivalCoord = {
            latitude: Number(festival.location.latitude),
            longitude: Number(festival.location.longitude)
        };
        const distance = haversineDistance(userCoord, festivalCoord);
        return {
            name: festival.name,
            distance: isNaN(distance) ? "Fehler!" : distance.toFixed(1) + " km"
        };
    });

    updateSidebar(distances);
}

function updateSidebar(distances) {
    distances.forEach(entry => {
        console.log(`Suche nach: ${entry.name}`); // Debugging

        // Hier wird angenommen, dass jedes Festival ein Element mit einer ID hat, die auf dem Festivalnamen basiert.
        const festivalDistanceElement = document.getElementById(`distance-${entry.name}`);

        if (festivalDistanceElement) {
            console.log(`Aktualisiere ${entry.name} mit ${entry.distance}`); // Debugging
            festivalDistanceElement.textContent = entry.distance;
        }
    });
}





export { toggleDraggableMarker };
