import { updateSidebar } from './info.js';

function createMap()
{
    const map = L.map('map', {
        center: [51.1657, 10.4515],
        zoom: 6, // Standard-Zoomlevel
        minZoom: 6, // Minimales Zoomlevel (nicht weiter raus zoomen)
        maxZoom: 12, // Maximales Zoomlevel (weiter rein zoomen möglich)
    }).setView([51.1657, 10.4515], 6); // Karte zentrieren
    
    // Grenzen für Deutschland
    const bounds = [[47.2701, 5.8663], [55.0581, 15.0419]];
    
    // Beschränkung auf Deutschland-Grenzen
    map.setMaxBounds(bounds);
    
    // Füge OpenStreetMap-Tiles hinzu
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    
    // Karte zentrieren und in den Grenzen halten
    map.fitBounds(bounds);

    return map;
}

function addMarkers(map, festivals)
{
    festivals.forEach(festival => {
        const { location, logo } = festival;

        const customIcon = L.icon({
            iconUrl: logo,
            iconSize: [70, 70],
            iconAnchor: [35, 70],
            popupAnchor: [0, -50],
        });

        const marker = L.marker([location.latitude, location.longitude], { icon: customIcon }).addTo(map);

        marker.on('click', () => {
            updateSidebar(festival, festivals);
        });
    });
}

export{ createMap, addMarkers };