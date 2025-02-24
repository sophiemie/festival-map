function toggleDraggableMarker(map) {
    const rangeInput = document.getElementById('range-input');
    const removeMarkerIcon = document.getElementById('remove-marker');

    if (!map) return console.error("Map ist nicht definiert!");

    if (window.userMarker) {
        map.removeLayer(window.userMarker);
        map.removeLayer(window.userCircle);
        window.userMarker = null;
        window.userCircle = null;
        rangeInput.style.display = 'none'; // Eingabefeld verstecken
        removeMarkerIcon.style.display = 'none'; // "X" verstecken
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

    rangeInput.style.display = 'inline-block'; // Eingabefeld anzeigen
    removeMarkerIcon.style.display = 'block'; // "X" anzeigen

    marker.on('drag', () => {
        circle.setLatLng(marker.getLatLng());
    });

    rangeInput.addEventListener('input', (e) => {
        circle.setRadius(e.target.value * 1000);
    });
}


export { toggleDraggableMarker };
